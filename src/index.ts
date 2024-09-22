import {
    EngineManager,
    Camera,
    Vector,
    RenderService,
    Sprite,
    GameObject,
    MeshRenderer,
    SquareMesh
} from "kneekeetah-game-engine";
import {HEIGHT, TERRAIN_HEIGHT, WIDTH} from "./const/dimensions.const";
import { SPRITE_DIMENSIONS } from "./const/animation_names.const";
import Player from "./models/Player";
let camera: Camera;
function createCamera() {
    const canvas = document.getElementById('root') as HTMLCanvasElement;
    if (!canvas) {
        console.warn('NO CANVAS FOUND.');
        return;
    }
    const context = canvas.getContext('2d');
    camera = new Camera({
        canvas, context, height: HEIGHT, width: WIDTH, backgroundColor: '#87CEEB',
    });
    camera.deadZoneX = 100;
    camera.deadZoneY = 30;
    RenderService.cameras.add(camera);
}
async function createPlayer() {
    const player = new Player();
    await player.spawn();

    const { x, y } = player.getActorDimensions();

    player.translate.setPosition(new Vector(
        (WIDTH / 2) - (x / 2),
        (HEIGHT / 2) - (y / 2),
    ))
    if (!camera) return;
    camera.target = player.gameObject;
}
async function loadTerrainBlockSprite() {
    return (await import('../assets/sprites/terrain/terrain.png')).default;
}
async function prepareGameWorld() {
    createCamera();
    await createPlayer();
    const terrainBlockSpriteSource = await loadTerrainBlockSprite();
    for (let x = 0; x < 100; x++) {
        for (let y = 0; y < 100; y++) {
            const block = new GameObject();
            const isUnderground = y > 0;
            const cropY = isUnderground ? 64 : 32;
            const cropX = isUnderground ? 9 * 32 : 64;
            const terrainTileSprite = new Sprite({ height: 64, width: 64, cropWidth: 32, cropHeight: 32, cropX, cropY });
            terrainTileSprite.translate = block.translate;
            await terrainTileSprite.loadImage(terrainBlockSpriteSource);
            RenderService.drawables.add(terrainTileSprite);
            if (y > 0) {
                block.translate.setPosition(new Vector(64 * x, TERRAIN_HEIGHT + (y * 64) + 82));
                continue;
            }
            block.translate.setPosition(new Vector(64 * x, TERRAIN_HEIGHT + 82));
        }
    }
}
async function startApp() {
    await prepareGameWorld();

    const engineManager = new EngineManager();
    engineManager.start();
}
startApp();
