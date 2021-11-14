import {Scene} from "@babylonjs/core/scene"
import {Color4} from "@babylonjs/core/Maths/math.color"
import {Texture} from "@babylonjs/core/Materials/Textures/texture"
import {ParticleSystem} from "@babylonjs/core/Particles/particleSystem"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {TransformNode} from "@babylonjs/core/Meshes/transformNode"
import {Particle} from "@babylonjs/core/Particles/particle"
import TypedEvent from "./misc/TypedEvent";
import {Animation} from "@babylonjs/core/Animations/animation";
import {Animatable} from "@babylonjs/core/Animations/animatable";

const oldFunc = Particle.prototype._inheritParticleInfoToSubEmitters.bind(Particle.prototype._inheritParticleInfoToSubEmitters)

Particle.prototype._inheritParticleInfoToSubEmitters = function() {
    try {
        oldFunc()
        this.angle = Math.atan2(this.position.y - 5, this.position.x)
    } catch (e) {

    }
}

const StartWarpSpeedAnimation = new Animation('StartWarpSpeedAnimation', 'minScaleX', 60, Animation.ANIMATIONTYPE_FLOAT)
StartWarpSpeedAnimation.setKeys([
    { frame: 0, value: 2 },
    { frame: 5 * 60, value: 50 },
])
const StopWarpSpeedAnimation = new Animation('StopWarpSpeedAnimation', 'minEmitPower', 60, Animation.ANIMATIONTYPE_FLOAT)
StopWarpSpeedAnimation.setKeys([
    { frame: 0, value: 50 },
    { frame: 120, value: 10 },
])

export default class WarpSpeedParticlesSystem extends ParticleSystem {
    public readonly animationEndEvent = new TypedEvent<void>()

    constructor(scene: Scene) {
        super('WarpSpeedParticlesSystem', 2000, scene)
        this.particleTexture = new Texture('/scene/star.png', scene)
        this.minLifeTime = 2
        this.maxLifeTime = 2
        this.blendMode = ParticleSystem.BLENDMODE_ADD
        this.minEmitPower = 50
        this.maxEmitPower = 50
        this.updateSpeed = 0.05
        this.emitRate = 300
        this.preWarmStepOffset = 5
        this.minSize = 0.2
        this.maxSize = 0.2
        this.minScaleX = 2
        this.color1 = Color4.FromHexString('#ffffffff')
        this.color2 = Color4.FromHexString('#bcfffcdd')
        this.colorDead = Color4.FromHexString('#ffffffff')
        this.createDirectedCylinderEmitter(10, 5, 0.1, new Vector3(0, 1, 0), new Vector3(0, 1, 0))
        const anchor = new TransformNode('')
        anchor.position = new Vector3(0, 5, 60)
        anchor.rotation.x = Math.PI / 2 + Math.PI
        this.emitter = anchor as any
    }

    public runStartAnimation(): Animatable {
        if (!this._scene) throw new Error()
        this.start()
        return this._scene.beginDirectAnimation(this, [ StartWarpSpeedAnimation ], 0, StartWarpSpeedAnimation.getHighestFrame(), false)
    }

    public runStopAnimation(): Animatable {
        if (!this._scene) throw new Error()
        this._scene.beginDirectAnimation(this, [ StartWarpSpeedAnimation ], StartWarpSpeedAnimation.getHighestFrame(), 0, false, 2)
        return this._scene.beginDirectAnimation(this, [ StopWarpSpeedAnimation ], 0, StopWarpSpeedAnimation.getHighestFrame(), false)
    }
}