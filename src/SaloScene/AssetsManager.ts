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
import UserPanelPrefab from "./misc/UserPanelPrefab"
import {StandardMaterial} from "@babylonjs/core/Materials/standardMaterial"

export default class SceneAssetsManager extends AssetsManager {
    private _stars: TransformNode | undefined
    private _staticStars: Mesh | undefined
    private _userPanelPrefab: UserPanelPrefab | undefined
    private _nebulaTransform: TransformNode | undefined

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

    get nebulaTransform(): TransformNode {
        if (!this._nebulaTransform) throw new Error()
        return this._nebulaTransform
    }

    constructor(public readonly scene: Scene) {
        super(scene)
    }

    public async performLoad(avatars: Array<string>): Promise<void> {
        this.loadTextures().catch(console.error)
        this.addTextureTask('starTexture', '/scene/star.png', true, false)
        const gl = new GlowLayer('stars', this.scene, { blurKernelSize: 64 })
        gl.intensity = 3
        const starNodeMaterial = await NodeMaterial.ParseFromSnippetAsync("CAB0JT#12", this.scene)

        const starsTask = this.addMeshTask('stars', '', '/scene/', 'saloStars.glb')
        starsTask.onSuccess = async ({ loadedMeshes }) => {
            const starsTransform = new TransformNode('StarsTransform')
            loadedMeshes[0].getChildren(undefined, true).forEach((node) => {
                if (node instanceof Mesh && node.name === 'sphereStar.001') {
                    node.isPickable = false
                    const virtualStars = node.instances.filter(({ name }) => name.indexOf('VIRTUAL') !== -1)
                    const pickableStars = node.instances.filter(({ name }) => name.indexOf('PICKABLE') !== -1)
                    replaceInstancesWithThinInstances(node.instances.filter(({ name }) => name.indexOf('VIRTUAL') === -1 && name.indexOf('PICKABLE') === -1))
                    node.material = starNodeMaterial
                    starNodeMaterial.build()
                    gl.referenceMeshToUseItsOwnMaterial(node)
                    node.parent = starsTransform
                    this._stars = starsTransform

                    this._userPanelPrefab = new UserPanelPrefab(avatars, virtualStars, this.scene)
                    virtualStars.forEach((mesh) => {
                        mesh.parent = starsTransform
                        mesh.isPickable = false
                    })
                    pickableStars.forEach((mesh) => {
                        mesh.parent = starsTransform
                        mesh.isPickable = true
                    })

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

    private loadTextures(): Promise<void> {
        this._nebulaTransform = new TransformNode('nebulas')
        this.nebulaTransform.position.z = 300
        const promises = Object.keys(texturesPreset).map((textureName) => {
            return new Promise<void>((resolve) => {
                const textureTask = this.addTextureTask(textureName, `/scene/${textureName}.png`, true)
                textureTask.onSuccess = ({ texture }) => {
                    const preset = texturesPreset[textureName]
                    const plane = MeshBuilder.CreatePlane(textureName, { size: preset.size }, this.scene)
                    const material = new StandardMaterial(textureName, this.scene)
                    material.specularColor.set(0, 0, 0)
                    material.diffuseTexture = texture
                    material.emissiveTexture = texture
                    material.specularTexture = texture
                    material.opacityTexture = texture
                    material.alphaMode = 1
                    plane.material = material
                    plane.position = preset.position
                    plane.parent = this.nebulaTransform
                    resolve()
                }
            })
        })

        return Promise.all(promises).then(() => void 0)
    }
}

const texturesPreset: { [key: string]: { size: number, position: Vector3 } } = {
    // galaxy_blue: {
    //     size: 3,
    //     position: new Vector3(-1.25, 0, 80),
    // },
    // galaxy_pink: {
    //     size: 4,
    //     position: new Vector3(2.5, 0, 130),
    // },
    nebula_blue: {
        size: 10,
        position: new Vector3(-1.25, 5, 47.5),
    },
    nebula_pink: {
        size: 20,
        position: new Vector3(6.4, 5, 60),
    },
}