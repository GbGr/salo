import {Animation} from "@babylonjs/core/Animations/animation"
import {SineEase} from "@babylonjs/core/Animations/easing"

const StaticStarsScaleAnimation = new Animation('StaticStarsScaleAnimation', 'scaling.z', 60, Animation.ANIMATIONTYPE_FLOAT)

StaticStarsScaleAnimation.setEasingFunction(new SineEase())

StaticStarsScaleAnimation.setKeys([
    { frame: 0, value: 1 },
    { frame: 120, value: -100 },
])

export default StaticStarsScaleAnimation