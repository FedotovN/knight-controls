var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SpriteAnimator } from "kneekeetah-game-engine";
import { ANIMATIONS_NAMES, ANIMATIONS_FILES_ENUM, SPRITE_DIMENSIONS } from '../const/animation_names.const';
function createAnimations(spriteAnimator) {
    return __awaiter(this, void 0, void 0, function* () {
        const loadingAnimations = ANIMATIONS_NAMES.map((name) => __awaiter(this, void 0, void 0, function* () {
            const { fileName, framesAmount, staggerFrames, flipped } = ANIMATIONS_FILES_ENUM[name];
            const { default: source } = yield import(`../../assets/sprites/${fileName}`);
            return spriteAnimator.createAnimation(source, name, framesAmount, staggerFrames, flipped);
        }));
        const createdAnimations = yield Promise.all(loadingAnimations);
        createdAnimations.forEach((animation) => spriteAnimator.addAnimation(animation));
    });
}
export function prepareSpriteAnimator(strokeBoundaries = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const scale = 1.75;
        const spriteAnimator = new SpriteAnimator({
            frameRect: { height: SPRITE_DIMENSIONS.y, width: SPRITE_DIMENSIONS.x },
            animatorRect: { height: SPRITE_DIMENSIONS.y * scale, width: SPRITE_DIMENSIONS.x * scale },
            strokeBoundaries,
        });
        yield createAnimations(spriteAnimator);
        return spriteAnimator;
    });
}
