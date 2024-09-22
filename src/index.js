var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EngineManager, Camera, Vector, RenderService } from "kneekeetah-game-engine";
import { HEIGHT, WIDTH } from "./const/dimensions.const";
import Player from "./models/Player";
function createCamera() {
    const canvas = document.getElementById('root');
    if (!canvas) {
        console.warn('NO CANVAS FOUND.');
        return;
    }
    const context = canvas.getContext('2d');
    const camera = new Camera({
        canvas, context, height: HEIGHT, width: WIDTH, backgroundColor: 'white',
    });
    RenderService.cameras.add(camera);
}
function createPlayer() {
    return __awaiter(this, void 0, void 0, function* () {
        const player = new Player();
        yield player.spawn();
        const { x, y } = player.getActorDimensions();
        player.translate.setPosition(new Vector((WIDTH / 2) - (x / 2), (HEIGHT / 2) - (y / 2)));
    });
}
function prepareGameWorld() {
    return __awaiter(this, void 0, void 0, function* () {
        createCamera();
        yield createPlayer();
    });
}
function startApp() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prepareGameWorld();
        const engineManager = new EngineManager();
        engineManager.start();
    });
}
startApp();
