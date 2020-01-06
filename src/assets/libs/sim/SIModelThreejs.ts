import { ITjsAttribData, ITjsGeomData, ITjsMaterial, ETjsMaterialType } from './common';
import { SIModel } from './SIModel';
import { memorySizeOf } from './mem';
import { flatbuffers } from 'flatbuffers';
import { tjs } from './tjs_data_generated';
import __ from 'underscore';
import * as THREE from 'three';

/**
 * Geo-info model class.
 */
export class SIModelThreejs {
    private _model: SIModel;

   /**
     * Constructor
     */
    constructor(model: SIModel) {
        this._model = model;
    }
    /**
     * Returns arrays for visualization in Threejs.
     */
    public getTjsData(): [Uint8Array, THREE.Material[]] {

        // get the data
        const attrib_data: ITjsAttribData = this._model.attribs.threejs.getTjsSeqAttribData();
        const geom_data: ITjsGeomData = this._model.geom.threejs.getTjsSeqGeomData(attrib_data.verts_i_to_idx);

        // make the flat buffer
        const fb_tjs_data: Uint8Array = this._createFlatBuf(geom_data, attrib_data);

        // make the materials
        const tjs_materials: THREE.Material[] = this._createTrisMatArr(geom_data.materials);
        return [fb_tjs_data, tjs_materials];
    }

    private _createFlatBuf(geom_data: ITjsGeomData, attrib_data: ITjsAttribData): Uint8Array {
        // create the builder
        const builder = new flatbuffers.Builder(1024);

        // create the data that wil be added to the TjsData

        // // materials
        // const fb_materials = [];
        // for (const material of geom_data.materials) {

        //     // create material
        //     tjs.data.Material.startMaterial(builder);
        //     tjs.data.Material.addType(builder, ETjsMaterialTypeInt[material.type] as number);
        //     tjs.data.Material.addSide(builder, material.side as number);
        //     if ('vertexColors' in material) { tjs.data.Material.addVertexColors(builder, material.vertexColors); }
        //     if ('color' in material) {
        //         const [r, g, b] = material.color.toArray();
        //         tjs.data.Material.addColor( builder, tjs.data.Color.createColor(builder, r, g, b ) );
        //     }
        //     if ('emissive' in material) {
        //         const [r, g, b] = material.color.toArray();
        //         tjs.data.Material.addEmissive( builder, tjs.data.Color.createColor(builder, r, g, b ) );
        //     }
        //     if ('specular' in material) {
        //         const [r, g, b] = material.color.toArray();
        //         tjs.data.Material.addSpecular( builder, tjs.data.Color.createColor(builder, r, g, b ) );
        //     }
        //     if ('transparent' in material) { tjs.data.Material.addType(builder, material.transparent); }
        //     if ('shininess' in material) { tjs.data.Material.addShininess(builder, material.shininess); }
        //     if ('roughness' in material) { tjs.data.Material.addRoughness(builder, material.roughness); }
        //     if ('metalness' in material) { tjs.data.Material.addMetalness(builder, material.metalness); }
        //     if ('reflectivity' in material) { tjs.data.Material.addReflectivity(builder, material.reflectivity); }
        // }
        // tjs.data.TjsData.createMaterialsVector(builder, fb_materials);

        // material groups
        const material_groups_flat: number[] = __.flatten(geom_data.material_groups, true);
        const fb_material_groups_flat: number =
            tjs.data.TjsData.createMaterialGroupsFlatVector(builder, material_groups_flat);

        // tris
        const fb_tris_verts_idx_flat: number =
            tjs.data.TjsData.createTrisVertsIdxFlatVector(builder, geom_data.tris_verts_idx_flat);
        const fb_tris_select_idx_to_i: number =
            tjs.data.TjsData.createTrisSelectIdxToIVector(builder, geom_data.tris_select_idx_to_i);

        // edges
        const fb_edges_verts_idx_flat: number =
            tjs.data.TjsData.createEdgesVertsIdxFlatVector(builder, geom_data.edges_verts_idx_flat);
        const fb_edges_select_idx_to_i: number =
            tjs.data.TjsData.createEdgesSelectIdxToIVector(builder, geom_data.edges_select_idx_to_i);

        // points
        const fb_points_verts_idx_flat: number =
            tjs.data.TjsData.createPointsVertsIdxFlatVector(builder, geom_data.points_verts_idx_flat);
        const fb_points_select_idx_to_i: number =
            tjs.data.TjsData.createPointsSelectIdxToIVector(builder, geom_data.points_select_idx_to_i);

        // coords, colors, normals
        const fb_coords: number = tjs.data.TjsData.createCoordsFlatVector(builder, attrib_data.coords_flat);
        const fb_colors: number = tjs.data.TjsData.createColorsFlatVector(builder, attrib_data.colors_flat);
        // const fb_normals: number = tjs.data.TjsData.createNormalsFlatVector(builder, attrib_data.normals_flat);

        // posis and verts
        const fb_posis_idx_to_i: number = tjs.data.TjsData.createPosisIdxToIVector(builder, attrib_data.posis_idx_to_i);
        const fb_verts_idx_to_i: number = tjs.data.TjsData.createVertsIdxToIVector(builder, attrib_data.verts_idx_to_i);
        const fb_verts_i_to_idx: number = tjs.data.TjsData.createVertsIToIdxVector(builder, attrib_data.verts_i_to_idx);

        // START TjsData --------------------------------------
        tjs.data.TjsData.startTjsData(builder);

        // materials
        tjs.data.TjsData.addMaterialGroupsFlat(builder, fb_material_groups_flat);

        // tris
        tjs.data.TjsData.addTrisVertsIdxFlat(builder, fb_tris_verts_idx_flat);
        tjs.data.TjsData.addTrisSelectIdxToI(builder, fb_tris_select_idx_to_i);

        // edges
        tjs.data.TjsData.addEdgesVertsIdxFlat(builder, fb_edges_verts_idx_flat);
        tjs.data.TjsData.addEdgesSelectIdxToI(builder, fb_edges_select_idx_to_i);

        // points
        tjs.data.TjsData.addPointsVertsIdxFlat(builder, fb_points_verts_idx_flat);
        tjs.data.TjsData.addPointsSelectIdxToI(builder, fb_points_select_idx_to_i);

        // coords, colors, normals
        tjs.data.TjsData.addCoordsFlat(builder, fb_coords);
        tjs.data.TjsData.addColorsFlat(builder, fb_colors);
        // tjs.data.TjsData.addNormalsFlat(builder, fb_normals);

        // posis and verts
        tjs.data.TjsData.addPosisIdxToI(builder, fb_posis_idx_to_i);
        tjs.data.TjsData.addVertsIdxToI(builder, fb_verts_idx_to_i);
        tjs.data.TjsData.addVertsIdxToI(builder, fb_verts_i_to_idx);

        // end
        const fb_offset = tjs.data.TjsData.endTjsData(builder);
        builder.finish(fb_offset);
        // END TjsData --------------------------------------

        // make the buffer
        return builder.asUint8Array();
    }
    /**
     * Create the material array for threejs triangles
     */
    private _createTrisMatArr(materials: ITjsMaterial[]): THREE.Material[] {
        const tris_mat_arr: THREE.Material[] = [];
        // const colorf = new THREE.Color(parseInt(this.settings.colors.face_f.replace('#', '0x'), 16));
        // const colorb = new THREE.Color(parseInt(this.settings.colors.face_b.replace('#', '0x'), 16));
        const colorf = new THREE.Color(parseInt('0xFFFFFF', 16));
        const colorb = new THREE.Color(parseInt('0xDDDDDD', 16));
        for (let index = 0; index < materials.length; index++) {
            const material = materials[index];
            // if (this.settings.background.show) {
            //     element.envMap = this._scene.background;
            //     element.refractionRatio = 1;
            //     element.envMap.mapping = THREE.CubeRefractionMapping;
            // }
            let mat;
            if (index === 0) {
                delete material.type; material.color = colorf;
                mat = new THREE.MeshPhongMaterial(material);
            } else if (index === 1) {
                delete material.type;
                material.color = colorb;
                mat = new THREE.MeshPhongMaterial(material);
            } else {
                if (material.type === ETjsMaterialType.MeshBasicMaterial) {
                    delete material.type;
                    mat = new THREE.MeshBasicMaterial(material);
                } else if (material.type === ETjsMaterialType.MeshPhongMaterial) {
                    delete material.type;
                    mat = new THREE.MeshPhongMaterial(material);
                } else if (material.type === ETjsMaterialType.MeshPhysicalMaterial) {
                    delete material.type;
                    mat = new THREE.MeshPhysicalMaterial(material);
                } else if (material.type === ETjsMaterialType.MeshLambertMaterial) {
                    delete material.type;
                    mat = new THREE.MeshLambertMaterial(material);
                } else if (material.type === ETjsMaterialType.MeshStandardMaterial) {
                    delete material.type;
                    mat = new THREE.MeshStandardMaterial(material);
                }
            }
            tris_mat_arr.push(mat);
        }
        return tris_mat_arr;
    }
}
