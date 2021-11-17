// import "@babylonjs/core/Debug/debugLayer"
// import "@babylonjs/inspector"

import {Engine} from "@babylonjs/core/Engines/engine"
import {Scene} from "@babylonjs/core/scene"
import Camera from "./Camera"
import SceneAssetsManager from "./AssetsManager"
import WarpSpeedParticlesSystem from "./WarpSpeedParticlesSystem";
import StaticStarsScaleAnimation from "./animations/StaticStarsScaleAnimation";
import StaticStarsMoveAnimation from "./animations/StaticStarsMoveAnimation";
import NebulaInAnimation from "./animations/NebulaInAnimation";
import NebulaScaleAnimation from "./animations/NebulaScaleAnimation";

export default class Runtime {
    private readonly _engine: Engine
    private readonly _scene: Scene
    private readonly _camera: Camera
    private readonly _assetsManager: SceneAssetsManager
    private readonly _warpSpeed: WarpSpeedParticlesSystem

    constructor(private readonly _renderCanvas: HTMLCanvasElement) {
        this._engine = new Engine(this._renderCanvas, true, {}, true)
        this._scene = new Scene(this._engine)
        this._camera = new Camera(this._scene)
        this._assetsManager = new SceneAssetsManager(this._scene)
        this._warpSpeed = new WarpSpeedParticlesSystem(this._scene)

        this._scene.clearColor.set(0, 0, 0, 1)

        // @ts-ignore
        window['runtime'] = this
    }

    public async startup(avatars: Array<string>): Promise<void> {
        this.resize()
        window.addEventListener('resize', this.resize)
        this._engine.runRenderLoop(this.update)
        await this._assetsManager.performLoad(avatars)
        // await this._scene.debugLayer.show()
        this._scene.onPointerPick = (e, pickInfo) => {
            if (!pickInfo?.pickedMesh) return
            if (pickInfo?.pickedMesh.name === 'PICKABLE_STAR') {
                alert('click yourself')
            }
        }

        this.playIntro()
    }

    public dispose(): void {
        this._engine.stopRenderLoop(this.update)
        window.removeEventListener('resize', this.resize)
        this._scene.dispose()
        this._engine.dispose()
    }

    private playIntro(): void {
        const animatable = this._warpSpeed.runStartAnimation()
        this._assetsManager.stars.setEnabled(false)
        this._scene.beginDirectAnimation(this._assetsManager.nebulaTransform, [ NebulaScaleAnimation ], 0, NebulaScaleAnimation.getHighestFrame())
        animatable.onAnimationEndObservable.addOnce(() => {
            this._warpSpeed.runStopAnimation()
            this._camera.animateMoveToStars()
            this._scene.beginDirectAnimation(this._assetsManager.nebulaTransform, [ NebulaInAnimation ], 0, 80)
            this._camera.movedToStarsEvent.once(() => {
                this._warpSpeed.stop()
                this._assetsManager.stars.setEnabled(true)
                this._camera.enableInteractiveMode()
                this._assetsManager.userPanelPrefab.showPanels(this._camera)
            })
        })

        this._assetsManager.staticStars.scaling.set(1, 1, -100)
        this._scene.beginDirectAnimation(this._assetsManager.staticStars, [ StaticStarsMoveAnimation ], 0, StaticStarsMoveAnimation.getHighestFrame(), false)
        setTimeout(() => this._scene.beginDirectAnimation(this._assetsManager.staticStars, [ StaticStarsScaleAnimation ], StaticStarsScaleAnimation.getHighestFrame(), 0, false), 4300)
    }

    private update = (): void => {
        this._scene.render()
    }

    private resize = (): void => {
        this._engine.resize()
    }
}