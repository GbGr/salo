import {Container, Ellipse, Image} from "@babylonjs/gui"
import {Scene} from "@babylonjs/core/scene"
import {InstancedMesh} from "@babylonjs/core/Meshes/instancedMesh"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {AdvancedDynamicTexture} from "@babylonjs/gui/2D"
import Camera from "../Camera";

export default class UserPanelPrefab {
    private readonly _gui: AdvancedDynamicTexture

    constructor(
        private readonly _avatars: Array<string>,
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
            const progress = camera.progress * 30
            const panelsCount = this._virtualStars.length

            this._virtualStars.forEach((host, idx) => {
                const hostProgress = idx / panelsCount
                const panel = hostHasPanel.get(host)
                if (!panel) throw new Error()
                if (idx === 0 && progress < 0.4) {
                    panel.alpha = 1
                    panel.scaleX = panel.scaleY = 1
                    return
                }
                panel.scaleX = panel.scaleY = progress > 3
                    ? Math.max((1 - (progress - 3) / 2) * 0.3, 0)
                    : (progress - hostProgress) > 0.2
                        ? 0.3
                        : Math.min((1 - hostProgress) * progress, 1)
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