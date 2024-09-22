var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GameObject, InputService, Rigidbody, Translate, Vector, TickService, } from "kneekeetah-game-engine";
import { prepareSpriteAnimator } from "../utils/loadSprites";
import { TERRAIN_HEIGHT } from "../const/dimensions.const";
export default class Player {
    constructor() {
        this.translate = new Translate();
        this.lookingDirection = new Vector(1, 0);
        this.isFalling = false;
        this._gameObject = new GameObject();
        this.movementSpeed = .6 / 1000;
        this.fallingMovementSpeed = .6 / 1000;
        this.crouchSpeed = .1;
        this.jumpForce = 20;
        this.gravityForce = .4;
        this.isRotatingToLeft = false;
        this.isRotatingToRight = false;
        this.isRunningToLeft = false;
        this.isRunningToRight = false;
        this._gameObject.translate = this.translate;
    }
    spawn() {
        return __awaiter(this, void 0, void 0, function* () {
            const spriteAnimator = yield prepareSpriteAnimator(true);
            const rigidbody = new Rigidbody();
            spriteAnimator.play({ name: 'idle', looped: true });
            this._gameObject.setComponent(spriteAnimator);
            this._gameObject.setComponent(rigidbody);
            this._setupControls();
            this._gameObject.instantiate();
        });
    }
    getActorDimensions() {
        const spriteAnimator = this._gameObject.getComponent('spriteAnimator');
        const { height, width } = spriteAnimator.config.animatorRect;
        return new Vector(width, height);
    }
    _playAnimationForLookingDirection(sa, rightAnimation, leftAnimation) {
        const { x } = this.lookingDirection;
        if (x > 0)
            return sa.play(rightAnimation);
        else
            return sa.play(leftAnimation);
    }
    _fallingMovementHandler(rb, sa) {
        return __awaiter(this, void 0, void 0, function* () {
            const { x } = this.lookingDirection;
            const rightAnimation = { name: 'jump-fall', once: true };
            const leftAnimation = { name: 'jump-fall-left', once: true };
            yield this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
            rb.push(x * this.fallingMovementSpeed, 0);
        });
    }
    _crouchingMovementHandler(rb, sa) {
        return __awaiter(this, void 0, void 0, function* () {
            const { x } = this.lookingDirection;
            const rightAnimation = { name: 'crouch-walk', looped: true, once: true };
            const leftAnimation = { name: 'crouch-walk-left', looped: true, once: true };
            yield this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
            rb.push(x * this.crouchSpeed, 0);
        });
    }
    _runningMovementHandler(rb, sa) {
        return __awaiter(this, void 0, void 0, function* () {
            const { x } = this.lookingDirection;
            const rightAnimation = { name: 'run', looped: true, once: true };
            const leftAnimation = { name: 'run-left', looped: true, once: true };
            yield this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
            rb.push(x * this.movementSpeed, 0);
        });
    }
    _movementHandler(rb, sa) {
        return __awaiter(this, void 0, void 0, function* () {
            const { x, y } = this.lookingDirection;
            const isCrouching = y > 0;
            if (isCrouching)
                return this._crouchingMovementHandler(rb, sa);
            if (this.isFalling)
                return this._fallingMovementHandler(rb, sa);
            return this._runningMovementHandler(rb, sa);
        });
    }
    _crouchStandHandler(rb, sa) {
        return __awaiter(this, void 0, void 0, function* () {
            const rightAnimation = { name: 'crouch', looped: true, once: true };
            const leftAnimation = { name: 'crouch-left', looped: true, once: true };
            yield this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
        });
    }
    _fallingStandHandler(rb, sa) {
        return __awaiter(this, void 0, void 0, function* () {
            const rightAnimation = { name: 'jump-fall', once: true, };
            const leftAnimation = { name: 'jump-fall-left', once: true, };
            yield this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
        });
    }
    _standHandler(rb, sa) {
        return __awaiter(this, void 0, void 0, function* () {
            const isCrouching = this.lookingDirection.y > 0;
            if (isCrouching)
                return yield this._crouchStandHandler(rb, sa);
            if (this.isFalling)
                return yield this._fallingStandHandler(rb, sa);
            const rightAnimation = { name: 'idle', looped: true, once: true };
            const leftAnimation = { name: 'idle-left', looped: true, once: true };
            yield this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
        });
    }
    _onCrouchHandler(rb, sa) {
        return __awaiter(this, void 0, void 0, function* () {
            const rightAnimation = { name: 'crouch', looped: true, once: true };
            const leftAnimation = { name: 'crouch-left', looped: true, once: true };
            yield this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
        });
    }
    _onJumpHandler(rb, sa) {
        return __awaiter(this, void 0, void 0, function* () {
            const rightAnimation = { name: 'jump', once: true };
            const leftAnimation = { name: 'jump-left', once: true };
            rb.push(0, -this.jumpForce);
            yield this._playAnimationForLookingDirection(sa, rightAnimation, leftAnimation);
        });
    }
    _goRightListener(rb, sa) {
        return {
            keyCode: 'KeyD',
            onDown: () => __awaiter(this, void 0, void 0, function* () {
                console.log('on down d');
                this.lookingDirection.x = 1;
                if (this.lookingDirection.y > 0 || this.isFalling)
                    return;
                this.isRotatingToRight = true;
                const leftAnimation = { name: 'turn-around' };
                yield sa.play(leftAnimation);
                this.isRotatingToRight = false;
            }),
            onHold: () => __awaiter(this, void 0, void 0, function* () {
                if (this.isRotatingToRight)
                    return;
                if (this.isRunningToLeft)
                    return;
                this.isRunningToRight = true;
                console.log('hold d');
                yield this._movementHandler(rb, sa);
            }),
            onUp: () => __awaiter(this, void 0, void 0, function* () {
                this.isRotatingToRight = false;
                this.isRunningToRight = false;
                yield this._standHandler(rb, sa);
            }),
        };
    }
    _goLeftListener(rb, sa) {
        return {
            keyCode: 'KeyA',
            onDown: () => __awaiter(this, void 0, void 0, function* () {
                console.log('on down a');
                this.lookingDirection.x = -1;
                if (this.lookingDirection.y > 0 || this.isFalling)
                    return;
                this.isRotatingToLeft = true;
                const rightAnimation = { name: 'turn-around-left' };
                yield sa.play(rightAnimation);
                this.isRotatingToLeft = false;
            }),
            onHold: () => __awaiter(this, void 0, void 0, function* () {
                if (this.isRotatingToLeft)
                    return;
                if (this.isRunningToRight)
                    return;
                console.log('hold a');
                this.isRunningToLeft = true;
                yield this._movementHandler(rb, sa);
            }),
            onUp: () => __awaiter(this, void 0, void 0, function* () {
                this.isRotatingToLeft = false;
                this.isRunningToLeft = false;
                yield this._standHandler(rb, sa);
            }),
        };
    }
    _jumpListener(rb, sa) {
        return {
            keyCode: 'KeyW',
            onDown: () => __awaiter(this, void 0, void 0, function* () {
                if (this.lookingDirection.y > 0)
                    return;
                yield this._onJumpHandler(rb, sa);
                yield this._standHandler(rb, sa);
            }),
        };
    }
    _crouchListener(rb, sa) {
        return {
            keyCode: 'KeyS',
            onDown: () => __awaiter(this, void 0, void 0, function* () {
                if (this.isFalling)
                    return;
                this.lookingDirection.y = 1;
                yield this._onCrouchHandler(rb, sa);
            }),
            onUp: () => __awaiter(this, void 0, void 0, function* () {
                this.lookingDirection.y = 0;
                yield this._standHandler(rb, sa);
            }),
        };
    }
    _attackListener(rb, sa) {
        return {
            keyCode: 'KeyS',
            onDown: () => { },
            onUp: () => { },
        };
    }
    _setupControls() {
        const sa = this._gameObject.getComponent('spriteAnimator');
        const rb = this._gameObject.getComponent('rigibody');
        rb.friction = .05;
        InputService.setListener(this._goRightListener(rb, sa));
        InputService.setListener(this._goLeftListener(rb, sa));
        InputService.setListener(this._jumpListener(rb, sa));
        InputService.setListener(this._crouchListener(rb, sa));
        InputService.setListener(this._attackListener(rb, sa));
        TickService.onUpdate(() => this._setupGravity(rb, sa));
    }
    _setupGravity(rb, sa) {
        return __awaiter(this, void 0, void 0, function* () {
            const { x, y } = this.translate.getActualPosition();
            if (y < TERRAIN_HEIGHT) {
                this.isFalling = true;
                rb.push(0, this.gravityForce);
            }
            else if (y >= TERRAIN_HEIGHT) {
                if (this.isFalling) {
                    this.isFalling = false;
                    yield this._standHandler(rb, sa);
                }
                this.isFalling = false;
                this.translate.setPosition(new Vector(x, TERRAIN_HEIGHT));
            }
        });
    }
}
