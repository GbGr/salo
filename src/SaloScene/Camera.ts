import {UniversalCamera} from "@babylonjs/core/Cameras/universalCamera"
import {Quaternion, Vector3} from "@babylonjs/core/Maths/math.vector"
import {Scene} from "@babylonjs/core/scene"
import {Animation} from "@babylonjs/core/Animations/animation"
import TypedEvent from "./misc/TypedEvent";
import {SineEase} from "@babylonjs/core/Animations/easing";

const moveToStarsAnimation = new Animation('moveToStarsAnimation', 'position.z', 60, Animation.ANIMATIONTYPE_FLOAT)
const easing = new SineEase()
easing.setEasingMode(SineEase.EASINGMODE_EASEOUT)
moveToStarsAnimation.setEasingFunction(easing)

const BASE_SPEED = 0.00001

export default class Camera extends UniversalCamera {
    public readonly movedToStarsEvent = new TypedEvent<void>()
    private readonly _targetRotation = Quaternion.Identity()
    private _progress = 0
    private _baseZ = 0

    get progress(): number {
        return this._progress
    }

    constructor(scene: Scene) {
        super('camera', new Vector3(0.03, 5.185, 20.61), scene)
        this.rotationQuaternion = Quaternion.Identity()
        this.minZ = 0.01

        this.attachControl()

        window.addEventListener('mousemove', this.followCursor)

        const engine = scene.getEngine()
        scene.onBeforeRenderObservable.add(() => {
            Quaternion.SlerpToRef(this.rotationQuaternion, this._targetRotation, engine.getDeltaTime() * 0.001, this.rotationQuaternion)
        })
    }

    public animateMoveToStars(): void {
        moveToStarsAnimation.setKeys([
            { frame: 0, value: this.position.z },
            { frame: 80, value: this.position.z + 30 },
        ])
        this._scene.beginDirectAnimation(this, [ moveToStarsAnimation ], 0, 80, false, 1, () => {
            this.movedToStarsEvent.emit()
        })
    }

    public enableInteractiveMode(): void {
        window.addEventListener('wheel', this.onWheel, { passive: false })
        this._baseZ = this.position.z
    }

    private followCursor = (e: MouseEvent): void => {
        const x = (((e.clientX / window.innerWidth) - 0.5) * 2) * (Math.PI * 0.1)
        const y = (((e.clientY / window.innerHeight) - 0.5) * 2) * (Math.PI * 0.1)

        Quaternion.FromEulerAnglesToRef(y, x, 0, this._targetRotation)
    }

    private onWheel = (e: WheelEvent): void => {
        e.preventDefault()
        e.stopPropagation()
        const factor = this._progress > 0.24 ? this._progress * 10 * BASE_SPEED : BASE_SPEED
        this._progress = Math.max(Math.min(this._progress + (e.deltaY * factor), 1), 0)
        this.position.z = this._baseZ - this._progress * 4.4
    }
}