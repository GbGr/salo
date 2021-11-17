import {createRef, FC, useEffect} from "react"
import Runtime from "./Runtime"

const SaloScene: FC = () => {
    const canvasRef = createRef<HTMLCanvasElement>()

    useEffect(() => {
        if (!canvasRef.current) throw new Error()

        const sceneRuntime = new Runtime(canvasRef.current)

        sceneRuntime.startup(new Array(50).fill('/scene/avatar.png')).catch(console.error)

        return () => {
            sceneRuntime.dispose()
        }
    }, [])

    return (
        <canvas ref={canvasRef} />
    )
}

export default SaloScene