import '@babylonjs/loaders/glTF'
import '@babylonjs/core/Materials/Node'
import '@babylonjs/core/Meshes/instancedMesh'
import '@babylonjs/core/Loading/loadingScreen'
import {AssetsManager} from "@babylonjs/core/Misc/assetsManager"
import {Mesh} from "@babylonjs/core/Meshes/mesh"
import replaceInstancesWithThinInstances from "./misc/convertToThinInstances"
import {Scene} from "@babylonjs/core/scene"
import {NodeMaterial} from "@babylonjs/core/Materials/Node/nodeMaterial"
import {GlowLayer} from "@babylonjs/core/Layers/glowLayer"
import {TransformNode} from "@babylonjs/core/Meshes/transformNode"
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder"
import {Matrix, Quaternion, Vector3} from "@babylonjs/core/Maths/math.vector"
import UserPanelPrefab from "./misc/UserPanelPrefab";

export default class SceneAssetsManager extends AssetsManager {
    private _stars: TransformNode | undefined
    private _staticStars: Mesh | undefined
    private _userPanelPrefab: UserPanelPrefab | undefined

    get stars(): TransformNode {
        if (!this._stars) throw new Error()
        return this._stars
    }

    get staticStars(): Mesh {
        if (!this._staticStars) throw new Error()
        return this._staticStars
    }

    get userPanelPrefab(): UserPanelPrefab {
        if (!this._userPanelPrefab) throw new Error()
        return this._userPanelPrefab
    }

    constructor(public readonly scene: Scene) {
        super(scene)
    }

    public async performLoad(): Promise<void> {
        this.addTextureTask('starTexture', '/scene/star.png', true, false)
        const gl = new GlowLayer('stars', this.scene, { blurKernelSize: 64 })
        gl.intensity = 3
        const starNodeMaterial = await NodeMaterial.ParseFromSnippetAsync("CAB0JT#12", this.scene)

        const starsTask = this.addMeshTask('stars', '', '/scene/', 'saloStars.glb')
        starsTask.onSuccess = async ({ loadedMeshes }) => {
            const starsTransform = new TransformNode('StarsTransform')
            loadedMeshes[0].getChildren(undefined, true).forEach((node) => {
                if (node instanceof Mesh && node.name === 'sphereStar.001') {
                    const virtualStarts = node.instances.filter(({ name }) => name.indexOf('VIRTUAL') !== -1)
                    replaceInstancesWithThinInstances(node.instances.filter(({ name }) => name.indexOf('VIRTUAL') === -1))
                    node.material = starNodeMaterial
                    starNodeMaterial.build()
                    gl.referenceMeshToUseItsOwnMaterial(node)
                    node.parent = starsTransform
                    this._stars = starsTransform

                    this._userPanelPrefab = new UserPanelPrefab(virtualStarts, this.scene)
                    virtualStarts.forEach((mesh) => mesh.parent = starsTransform)
                }
            })
            loadedMeshes[0].dispose()
            starsTransform.position.set(0, 0, 50)
        }

        const staticStar = MeshBuilder.CreateSphere('staticStar', { diameter: 1, segments: 4 }, this.scene)
        const STATIC_STARS_COUNT = 1500
        const MATRIX_BUFFER = new Matrix()
        const v3Scale = new Vector3()
        const v3Position = new Vector3()
        const quaternion = Quaternion.Identity()
        const bufferMatrices = new Float32Array(16 * STATIC_STARS_COUNT)

        for (let i = 0; i < STATIC_STARS_COUNT; i++) {
            v3Scale.setAll(0.1 + Math.random() * 0.1)
            v3Position.set(
                -50 + Math.random() * 100,
                -50 + Math.random() * 100,
                -50 + Math.random() * 100
            )
            Matrix.ComposeToRef(
                v3Scale,
                quaternion,
                v3Position,
                MATRIX_BUFFER
            )

            MATRIX_BUFFER.copyToArray(bufferMatrices, 16 * i)
        }

        staticStar.thinInstanceSetBuffer('matrix', bufferMatrices, 16)
        staticStar.material = starNodeMaterial
        gl.referenceMeshToUseItsOwnMaterial(staticStar)
        this._staticStars = staticStar
        staticStar.position.z = 70

        return this.loadAsync()
    }
}