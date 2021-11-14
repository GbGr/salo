import {Container, Ellipse, Image} from "@babylonjs/gui"
import {Scene} from "@babylonjs/core/scene"
import {InstancedMesh} from "@babylonjs/core/Meshes/instancedMesh"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {AdvancedDynamicTexture} from "@babylonjs/gui/2D"
import Camera from "../Camera";

export default class UserPanelPrefab {
    private readonly _gui: AdvancedDynamicTexture
    constructor(
        private readonly _virtualStars: Array<InstancedMesh>,
        private readonly _scene: Scene) {
        this._gui = AdvancedDynamicTexture.CreateFullscreenUI('GUI', true, this._scene)
    }

    public showPanels(camera: Camera): void {
        const v3Buffer1 = new Vector3()
        const v3Buffer2 = new Vector3()
        this._virtualStars.sort((left, right) => {
            return Math.abs(camera.position.subtractToRef(left.getAbsolutePosition(), v3Buffer1).length()) - Math.abs(camera.position.subtractToRef(right.getAbsolutePosition(), v3Buffer2).length())
        })

        const hostHasPanel = new Map<InstancedMesh, Container>()
        this._virtualStars.forEach((host) => {
            const panel = this.createPanel()
            panel.linkWithMesh(host)
            hostHasPanel.set(host, panel)
        })

        this._scene.onBeforeRenderObservable.add(() => {
            const progress = camera.progress / 0.2
            const visibleWindow = 0.1
            const panelsCount = this._virtualStars.length

            this._virtualStars.forEach((host, idx) => {
                const hostProgress = idx / panelsCount
                const panel = hostHasPanel.get(host)
                if (!panel) throw new Error()
                if (progress === 0) {
                    if (idx === 0) panel.alpha = 1
                    panel.scaleX = panel.scaleY = 1
                    return
                }
                if (progress > 1) {
                    panel.alpha = 1
                    panel.scaleX = panel.scaleY = 1
                    return
                }
                if (hostProgress < progress + visibleWindow && hostProgress > progress - visibleWindow) {
                    panel.alpha = 1
                    panel.scaleX = panel.scaleY = hostProgress > progress
                        ? (hostProgress - progress) > visibleWindow ? 0 : (hostProgress - progress) / visibleWindow
                        : (progress - hostProgress) > visibleWindow ? 0 : 1
                } else {
                    panel.alpha = 0
                    panel.scaleX = panel.scaleY = 0
                }
            })
        })
    }

    private createPanel(): Container {
        const avatarMask = new Ellipse('avatarMask')
        avatarMask.width = '200px'
        avatarMask.height = '200px'
        const avatar = new Image('avatar', '/scene/avatar.png')
        avatarMask.addControl(avatar)

        this._gui.addControl(avatarMask)

        return avatarMask
    }

}