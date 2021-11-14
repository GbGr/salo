import {createRef, FC, useEffect} from "react"
import Runtime from "./Runtime"

const SaloScene: FC = () => {
    const canvasRef = createRef<HTMLCanvasElement>()

    useEffect(() => {
        if (!canvasRef.current) throw new Error()

        const sceneRuntime = new Runtime(canvasRef.current)

        sceneRuntime.startup()

        return () => {
            sceneRuntime.dispose()
        }
    }, [])

    return (
        <canvas ref={canvasRef} />
    )
}

export default SaloScene