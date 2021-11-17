import {Animation} from "@babylonjs/core/Animations/animation";
import {SineEase} from "@babylonjs/core/Animations/easing";

const NebulaInAnimation = new Animation('NebulaInAnimation', 'position.z', 60, Animation.ANIMATIONTYPE_FLOAT)
NebulaInAnimation.setKeys([
    { frame: 0, value: 300 },
    { frame: 80, value: 0 },
])
const easing = new SineEase()
easing.setEasingMode(SineEase.EASINGMODE_EASEOUT)
NebulaInAnimation.setEasingFunction(easing)

export default NebulaInAnimation