import {
    GameObject,
    InputService,
    Rigidbody,
    SpriteAnimator,
    Translate,
    InputListenerOptions,
    Vector,
    PlayConfig, TickService, SquareMesh, RenderService,
} from "kneekeetah-game-engine";
import { prepareSpriteAnimator } from "../utils/loadPlayerSprites";
import { TERRAIN_HEIGHT } from "../const/dimensions.const";

type MovementDirection = 1 | -1;

export default class Player {
    translate: Translate = new Translate();
    lookingDirection: Vector = new Vector(1, 0);
    isFalling: boolean = false;
    isRolling: boolean = false;
    isCrouching: boolean = false;
    gameObject: GameObject = new GameObject();
    private isAttacking: boolean = false;
    private movementSpeed = .6;
    private fallingMovementSpeed = .6;
    private crouchSpeed = .1;
    private jumpForce = 30;
    private gravityForce = .4;
    private shouldTurnOnRotate: boolean = false;
    private isRotatingToLeft: boolean = false;
    private isRotatingToRight: boolean = false;
    private isRunningToLeft: boolean = false;
    private isRunningToRight: boolean = false;
    private isAttackingComboAllowed: boolean = false;
    private attackingComboTimeout: NodeJS.Timeout | null = null;
    constructor() {
        this.gameObject.translate = this.translate;
    }
    async spawn(){
        const spriteAnimator = await prepareSpriteAnimator();
        const rigidbody = new Rigidbody();
        this._standHandler(rigidbody, spriteAnimator, 1);
        this.gameObject.setComponent(spriteAnimator);
        this.gameObject.setComponent(rigidbody);
        this._setupControls();

        this.gameObject.instantiate();
    }
    getActorDimensions(): Vector {
        const spriteAnimator = this.gameObject.getComponent('spriteAnimator') as SpriteAnimator;
        const { height, width } = spriteAnimator.config.animatorRect;
        return new Vector(width, height);
    }
    private _playAnimationForLookingDirection(sa: SpriteAnimator, rightAnimation: PlayConfig, leftAnimation: PlayConfig){
        const { x } = this.lookingDirection;
        if (x > 0) return sa.play(rightAnimation)
        else return sa.play(leftAnimation);
    }
    private async _fallingMovementHandler(rb: Rigidbody, sa: SpriteAnimator, dir: MovementDirection) {
        this.lookingDirection.x = dir;
        const { x } = this.lookingDirection;
        const rightAnimation =  { name: 'jump-fall', once: true } as PlayConfig;
        const leftAnimation =   { name: 'jump-fall-left', once: true } as PlayConfig;
        await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);

        rb.push(x * this.fallingMovementSpeed, 0);
    }
    private async _crouchingMovementHandler(rb: Rigidbody, sa: SpriteAnimator, dir: MovementDirection) {
        this.lookingDirection.x = dir;
        const { x } = this.lookingDirection;
        const rightAnimation = { name: 'crouch-walk', looped: true, once: true } as PlayConfig;
        const leftAnimation =  { name: 'crouch-walk-left', looped: true, once: true } as PlayConfig;
        await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);

        rb.push(x * this.crouchSpeed, 0);
    }
    private async _runningMovementHandler(rb: Rigidbody, sa: SpriteAnimator, dir: -1 | 1) {
        const { x } = this.lookingDirection;
        const rightMov = dir === 1;
        const leftMov = dir === -1;
        if (this.isRotatingToRight || this.isRotatingToLeft) return;

        if (leftMov && this.isRunningToRight) return;
        if (rightMov && this.isRunningToLeft) return

        if (x === dir) {
            if (rightMov) this.isRunningToRight = true;
            if (leftMov) this.isRunningToLeft = true;
            const rightAnimation = { name: 'run', looped: true, once: true } as PlayConfig;
            const leftAnimation =  { name: 'run-left', looped: true, once: true } as PlayConfig;
            await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);

            rb.push(x * this.movementSpeed, 0);
            return;
        }
        if (!this.shouldTurnOnRotate) {
            this.lookingDirection.x = dir;
            return;
        }
        const animationToPlay = rightMov ? 'turn-around' : 'turn-around-left';
        if (rightMov) this.isRotatingToRight = true;
        if (leftMov) this.isRotatingToLeft = true;

        await sa.play({ name: animationToPlay });
        this.lookingDirection.x = dir;
        if (rightMov) this.isRotatingToRight = false;
        if (leftMov) this.isRotatingToLeft = false;
    }
    private async _movementHandler(rb: Rigidbody, sa: SpriteAnimator, dir: -1 | 1) {
        if (this.isAttacking || this.isRolling) return;
        if (this.isCrouching) return this._crouchingMovementHandler(rb, sa, dir);
        if (this.isFalling) return this._fallingMovementHandler(rb, sa, dir);
        return this._runningMovementHandler(rb, sa, dir);
    }
    private async _crouchStandHandler(rb: Rigidbody, sa: SpriteAnimator){
        const rightAnimation = { name: 'crouch', looped: true, once: true } as PlayConfig;
        const leftAnimation = { name: 'crouch-left', looped: true, once: true } as PlayConfig;
        await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
    }
    private async _fallingStandHandler(rb: Rigidbody, sa: SpriteAnimator){
        const rightAnimation = { name: 'jump-fall', once: true, } as PlayConfig;
        const leftAnimation = { name: 'jump-fall-left', once: true, } as PlayConfig;
        await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
    }
    private async _runningStandHandler(rb: Rigidbody, sa: SpriteAnimator, dir: 1 | -1 | 0){
        const rightMov = dir === 1;
        const leftMov = dir === -1;
        if (rightMov && this.isRunningToLeft) return;
        if (leftMov && this.isRunningToRight) return;
        if (rightMov) this.isRunningToRight = false;
        if (leftMov) this.isRunningToLeft = false;
        const rightAnimation = { name: 'idle', looped: true, once: true } as PlayConfig;
        const leftAnimation = { name: 'idle-left', looped: true, once: true } as PlayConfig;
        await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
    }
    private async _standHandler(rb: Rigidbody, sa: SpriteAnimator, dir?: MovementDirection) {
        const fallbackDirection = dir || this.lookingDirection.x as MovementDirection;
        if (this.isRolling) return;
        if (this.isCrouching) return await this._crouchStandHandler(rb, sa);
        if (this.isFalling) return await this._fallingStandHandler(rb, sa);
        return this._runningStandHandler(rb, sa, fallbackDirection);
    }
    private async _standingAttackHandler(rb: Rigidbody, sa: SpriteAnimator) {
        if (this.isAttackingComboAllowed) {
            if (this.attackingComboTimeout) clearTimeout(this.attackingComboTimeout)
            const rightAnimation = { name: 'attack-second', once: true } as PlayConfig;
            const leftAnimation = { name: 'attack-second-left', once: true } as PlayConfig;
            await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
            this.isAttackingComboAllowed = false;
            return;
        }
        const rightAnimation = { name: 'attack', once: true } as PlayConfig;
        const leftAnimation = { name: 'attack-left', once: true } as PlayConfig;
        await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
        this.isAttackingComboAllowed = true;
        setTimeout(() => this.isAttackingComboAllowed = false, 400);
    }
    private async _crouchAttackHandler(rb: Rigidbody, sa: SpriteAnimator) {
        const rightAnimation = { name: 'crouch-attack', once: true } as PlayConfig;
        const leftAnimation = { name: 'crouch-attack-left', once: true } as PlayConfig;
        await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
    }
    private async _attackHandler(rb: Rigidbody, sa: SpriteAnimator) {
        if (this.isCrouching) return await this._crouchAttackHandler(rb, sa);
        return this._standingAttackHandler(rb, sa);
    }
    private async _onCrouchHandler(rb: Rigidbody, sa: SpriteAnimator) {
        const rightAnimation = { name: 'crouch', looped: true, once: true } as PlayConfig;
        const leftAnimation = { name: 'crouch-left', looped: true, once: true } as PlayConfig;
        await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
    }
    private async _onJumpHandler(rb: Rigidbody, sa: SpriteAnimator) {

        const rightAnimation = { name: 'jump', once: true } as PlayConfig;
        const leftAnimation = { name: 'jump-left', once: true } as PlayConfig;
        rb.push(0, -this.jumpForce);

        await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
    }
    private _goRightListener(rb: Rigidbody, sa: SpriteAnimator): InputListenerOptions {
        return {
            keyCode: 'KeyD',
            onHold: async ({ startTimestamp, currTimestamp }) => {
                const timeElapsed = currTimestamp - startTimestamp;
                if (timeElapsed > 700) this.shouldTurnOnRotate = true;
                await this._movementHandler(rb, sa, 1);
            },
            onUp: async () => {
                setTimeout(() => {
                    this.shouldTurnOnRotate = false;
                }, 100);
                await this._standHandler(rb, sa, 1);
            },
        }
    }
    private _goLeftListener(rb: Rigidbody, sa: SpriteAnimator): InputListenerOptions {
        return {
            keyCode: 'KeyA',
            onHold: async ({ startTimestamp, currTimestamp }) => {
                const timeElapsed = currTimestamp - startTimestamp;
                if (timeElapsed > 700) this.shouldTurnOnRotate = true;
                await this._movementHandler(rb, sa, -1);
            },
            onUp: async () => {
                setTimeout(() => {
                    this.shouldTurnOnRotate = false;
                }, 100);
                await this._standHandler(rb, sa, -1);
            },
        }
    }
    private _jumpListener(rb: Rigidbody, sa: SpriteAnimator): InputListenerOptions {
        return {
            keyCode: 'KeyW',
            onDown: async () => {
                if (this.isFalling) return;
                await this._onJumpHandler(rb, sa);
                await this._standHandler(rb, sa);
            },
        }
    }
    private _crouchListener(rb: Rigidbody, sa: SpriteAnimator): InputListenerOptions {
        return {
            keyCode: 'KeyS',
            onDown: async () => {
                if (this.isFalling) return;
                this.isCrouching = true;
                await this._onCrouchHandler(rb, sa)
            },
            onHold: () => {
                this.isRotatingToRight = false;
                this.isRotatingToLeft = false;
                this.isRunningToRight = false;
                this.isRunningToLeft = false;
            },
            onUp: async () => {
                this.isCrouching = false;
                await this._standHandler(rb, sa);
            },
        }
    }
    private _attackListener(rb: Rigidbody, sa: SpriteAnimator): InputListenerOptions {
        return {
            keyCode: 'KeyK',
            onDown: async () => {
                if (this.isAttacking) return;
                this.isAttacking = true;
                await this._attackHandler(rb, sa);
                this.isAttacking = false;
                await this._standHandler(rb, sa);
            },
            onUp: async () => {
                if (!this.isAttacking) await this._standHandler(rb, sa);
            },
        }
    }
    private async _rollHandler(rb: Rigidbody, sa: SpriteAnimator) {
        const { x } = this.lookingDirection;
        const rightAnimation = { name: 'roll', once: true } as PlayConfig;
        const leftAnimation = { name: 'roll-left', once: true } as PlayConfig;
        rb.push(x * 20, 0);
        await this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);

    }
    private _rollListener(rb: Rigidbody, sa: SpriteAnimator): InputListenerOptions {
        return {
            keyCode: 'Space',
            onDown: async () => {
                if (this.isAttacking || this.isFalling || this.isCrouching || this.isRolling) return;
                this.isRolling = true;
                await this._rollHandler(rb, sa);
                this.isRolling = false;
                await this._standHandler(rb, sa);
            },
        }
    }
    private _setupControls() {
        const sa = this.gameObject.getComponent('spriteAnimator') as SpriteAnimator;
        const rb = this.gameObject.getComponent('rigibody') as Rigidbody;

        rb.friction = .05;

        InputService.setListener(this._goRightListener(rb, sa));
        InputService.setListener(this._goLeftListener(rb, sa));
        InputService.setListener(this._jumpListener(rb, sa));
        InputService.setListener(this._crouchListener(rb, sa));
        InputService.setListener(this._attackListener(rb, sa));
        InputService.setListener(this._rollListener(rb, sa));

        TickService.onUpdate(() => this._setupGravity(rb, sa));
    }
    private async _setupGravity(rb: Rigidbody, sa: SpriteAnimator) {
        const { x, y } = this.translate.getActualPosition();
        if (y < TERRAIN_HEIGHT + 55) {
            this.isFalling = true;
            rb.push(0, this.gravityForce);
        } else if (y >= TERRAIN_HEIGHT + 55) {
            if (this.isFalling) {
                this.isFalling = false;
                await this._standHandler(rb, sa);
            }
            this.isFalling = false;
            this.translate.setPosition(new Vector(x, TERRAIN_HEIGHT + 55));
        }
    }
}
