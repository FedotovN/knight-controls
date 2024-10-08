import { Vector } from "kneekeetah-game-engine";

export const SPRITE_DIMENSIONS = new Vector(120, 80);
export const ANIMATIONS_NAMES = [
    'idle',          'idle-left',
    'run',           'run-left',
    'attack',        'attack-left',
    'attack-second', 'attack-second-left',
    'crouch-attack', 'crouch-attack-left',
    'crouch',        'crouch-left',
    'crouch-walk',   'crouch-walk-left',
    'jump',          'jump-left',
    'roll',          'roll-left',
    'jump-fall',     'jump-fall-left',
    'turn-around',   'turn-around-left',
] as const;

type animationName = typeof ANIMATIONS_NAMES[number];
type animationConfig = { fileName: string, framesAmount: number, staggerFrames: number, flipped: boolean };
export const ANIMATIONS_FILES_ENUM: { [key in animationName]: animationConfig } = {
    'idle' :              { fileName: '_Idle.png', framesAmount: 10, staggerFrames: 10, flipped: false },
    'idle-left':          { fileName: '_IdleLeft.png', framesAmount: 10, staggerFrames: 10, flipped: true },
    'run':                { fileName: '_Run.png', framesAmount: 10, staggerFrames: 3, flipped: false },
    'run-left':           { fileName: '_RunLeft.png', framesAmount: 10, staggerFrames: 3, flipped: true },
    'attack':             { fileName: '_Attack.png', framesAmount: 4, staggerFrames: 3, flipped: false },
    'attack-left':        { fileName: '_AttackLeft.png', framesAmount: 4, staggerFrames: 3, flipped: true },
    'attack-second':      { fileName: '_Attack2.png', framesAmount: 4, staggerFrames: 3, flipped: false },
    'attack-second-left': { fileName: '_Attack2Left.png', framesAmount: 4, staggerFrames: 3, flipped: true },
    'crouch-attack':      { fileName: '_CrouchAttack.png', framesAmount: 4, staggerFrames: 3, flipped: false },
    'crouch-attack-left': { fileName: '_CrouchAttackLeft.png', framesAmount: 4, staggerFrames: 3, flipped: true },
    'crouch':             { fileName: '_Crouch.png', framesAmount: 1, staggerFrames: 1, flipped: false },
    'crouch-left':        { fileName: '_CrouchLeft.png', framesAmount: 1, staggerFrames: 1, flipped: true },
    'crouch-walk':        { fileName: '_CrouchWalk.png', framesAmount: 8, staggerFrames: 5, flipped: false },
    'crouch-walk-left':   { fileName: '_CrouchWalkLeft.png', framesAmount: 8, staggerFrames: 5, flipped: true },
    'jump':               { fileName: '_Jump.png', framesAmount: 3, staggerFrames: 3, flipped: false },
    'jump-left':          { fileName: '_JumpLeft.png', framesAmount: 3, staggerFrames: 3, flipped: false },
    'roll':               { fileName: '_Roll.png', framesAmount: 12, staggerFrames: 3, flipped: false },
    'roll-left':          { fileName: '_RollLeft.png', framesAmount: 12, staggerFrames: 3, flipped: true },
    'jump-fall':          { fileName: '_JumpFallInbetween.png', framesAmount: 2, staggerFrames: 3, flipped: false },
    'jump-fall-left':     { fileName: '_JumpFallInbetweenLeft.png', framesAmount: 2, staggerFrames: 3, flipped: true },
    'turn-around-left':   { fileName: '_TurnAround.png', framesAmount: 3, staggerFrames: 5, flipped: false },
    'turn-around':        { fileName: '_TurnAroundLeft.png', framesAmount: 3, staggerFrames: 5, flipped: true },
}
