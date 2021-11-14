import "@babylonjs/core/Meshes/thinInstanceMesh"
import {Matrix} from "@babylonjs/core/Maths/math.vector"
import {InstancedMesh} from "@babylonjs/core/Meshes/instancedMesh"

const MATRIX_BUFFER = new Matrix()

/**
 * Converts regular instances to thin instances (super instances)
 * @param instancedMeshes
 */
export default function replaceInstancesWithThinInstances(instancedMeshes: Array<InstancedMesh>): void {
    const sourceMesh = instancedMeshes[0].sourceMesh
    const bufferMatrices = new Float32Array(16 * (instancedMeshes.length + 1))

    instancedMeshes.forEach((instance, idx) => {
        if (!instance.rotationQuaternion) throw new Error()
        Matrix.ComposeToRef(
            instance.scaling,
            instance.rotationQuaternion,
            instance.position,
            MATRIX_BUFFER
        )

        MATRIX_BUFFER.copyToArray(bufferMatrices, 16 * idx)
    })

    if (!sourceMesh.rotationQuaternion) throw new Error()

    Matrix.ComposeToRef(
        sourceMesh.scaling,
        sourceMesh.rotationQuaternion,
        sourceMesh.position,
        MATRIX_BUFFER
    )
    MATRIX_BUFFER.copyToArray(bufferMatrices, 16 * instancedMeshes.length)
    sourceMesh.position.set(0, 0, 0)
    sourceMesh.rotationQuaternion.set(0, 0, 0, 1)
    sourceMesh.scaling.set(1, 1, 1)

    instancedMeshes.slice().forEach((instance) => instance.dispose())

    sourceMesh.thinInstanceSetBuffer('matrix', bufferMatrices, 16)
    // const a = document.createElement('a')
    // const blob = new Blob([bufferMatrices.buffer], { type: 'application/octet-stream' })
    // const url = URL.createObjectURL(blob)
    // a.href = url
    // a.download = 'starsMatrix.bin'
    // a.click()
}