import {Animation} from "@babylonjs/core/Animations/animation"
import {SineEase} from "@babylonjs/core/Animations/easing"

const StaticStarsMoveAnimation = new Animation('StaticStarsMoveAnimation', 'position.z', 60, Animation.ANIMATIONTYPE_FLOAT)

StaticStarsMoveAnimation.setEasingFunction(new SineEase())

StaticStarsMoveAnimation.setKeys([
    { frame: 0, value: 500 },
    { frame: 5 * 60, value: 0 },
])

export default StaticStarsMoveAnimation