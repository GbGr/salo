import {Animation} from "@babylonjs/core/Animations/animation";
import {SineEase} from "@babylonjs/core/Animations/easing";
import {Vector3} from "@babylonjs/core/Maths/math.vector";

const NebulaScaleAnimation = new Animation('NebulaScaleAnimation', 'scaling', 60, Animation.ANIMATIONTYPE_VECTOR3)
NebulaScaleAnimation.setKeys([
    { frame: 0, value: new Vector3(0.001, 0.001, 0.001) },
    { frame: 60 * 4.5, value: new Vector3(1, 1, 1) },
])
NebulaScaleAnimation.setEasingFunction(new SineEase())

export default NebulaScaleAnimation