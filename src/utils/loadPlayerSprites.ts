import {SpriteAnimationConfig, SpriteAnimator} from "kneekeetah-game-engine";
import {ANIMATIONS_NAMES, ANIMATIONS_FILES_ENUM, SPRITE_DIMENSIONS} from '../const/animation_names.const';
async function createAnimations(spriteAnimator: SpriteAnimator) {
    const loadingAnimations = ANIMATIONS_NAMES.map(async (name) => {
        const { fileName, framesAmount, staggerFrames, flipped } = ANIMATIONS_FILES_ENUM[name];
        const { default: source } = await import(`../../assets/sprites/player/${fileName}`);
        return spriteAnimator.createAnimation({ source, animationName: name, framesAmount, staggerFrames, flipped, offsetX: -105, offsetY: -70 });
    })
    const createdAnimations = await Promise.all(loadingAnimations);
    createdAnimations.forEach((animation: SpriteAnimationConfig) => spriteAnimator.addAnimation(animation));
}
export async function prepareSpriteAnimator(strokeBoundaries = false) {
    const scale = 1.75;
    const spriteAnimator = new SpriteAnimator({
        frameRect: { height: SPRITE_DIMENSIONS.y, width: SPRITE_DIMENSIONS.x },
        animatorRect: { height: SPRITE_DIMENSIONS.y * scale, width: SPRITE_DIMENSIONS.x * scale },
        strokeBoundaries,
    });
    await createAnimations(spriteAnimator);
    return spriteAnimator;
}
