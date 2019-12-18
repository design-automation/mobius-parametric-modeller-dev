import { ITjsData, ITjsMaterial, ITjsAttribData, ITjsGeomData } from './common';
import { SIModel } from './SIModel';
import * as THREE from 'three';
import { memorySizeOf } from './mem';
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
    public getTjsData(): ITjsData {

        // get the attribs at the vertex level
        const attrib_data: ITjsAttribData = this._model.attribs.threejs.getTjsSeqAttribData();

        // get the indices of the vertices for edges, points and triangles
        const geom_data: ITjsGeomData = this._model.geom.threejs.getTjsSeqGeomData(attrib_data.verts_i_to_idx);

        // Create attribute buffers that will be shared by all geometry
        const coords_buff_attrib = new THREE.BufferAttribute( new Float32Array(attrib_data.coords_flat), 3 );
        const colors_buff_attrib = new THREE.BufferAttribute( new Float32Array(attrib_data.colors_flat), 3 );
        const normals_buff_attrib = attrib_data.normals_flat === null ?
            null : new THREE.BufferAttribute( new Float32Array(attrib_data.normals_flat), 3 );

        // make the geometry buffers from the attribute buffers
        // triangles
        const tris_geom_buff: THREE.BufferGeometry = this._createTrisBuffGeom(
            geom_data.tris_verts_idx_flat, coords_buff_attrib, colors_buff_attrib, normals_buff_attrib, geom_data.material_groups);
        // lines
        const lines_geom_buff: THREE.BufferGeometry = this._createLinesBuffGeom(
            geom_data.edges_verts_idx_flat, coords_buff_attrib, colors_buff_attrib);
        // points
        const points_geom_buff: THREE.BufferGeometry = this._createPointsBuffGeom(
            geom_data.points_verts_idx_flat, coords_buff_attrib, colors_buff_attrib);
        // positions
        const posis_geom_buff: THREE.BufferGeometry = this._createPosisBuffGeom(
            attrib_data.posis_idx_to_i, coords_buff_attrib);

        // return an object containing all the data
        const data: ITjsData = {
            num_posis: attrib_data.posis_idx_to_i.length,
            num_points: geom_data.points_verts_idx_flat.length,
            num_lines: geom_data.edges_verts_idx_flat.length / 2,
            num_tris: geom_data.tris_verts_idx_flat.length / 3,

            tris_geom_buff: tris_geom_buff,
            lines_geom_buff: lines_geom_buff,
            points_geom_buff: points_geom_buff,
            posis_geom_buff: posis_geom_buff,

            posis_idx_to_i: attrib_data.posis_idx_to_i,
            verts_idx_to_i: attrib_data.verts_idx_to_i,
            points_select_idx_to_i: geom_data.points_select_idx_to_i,
            edges_select_idx_to_i: geom_data.edges_select_idx_to_i,
            tris_select_idx_to_i: geom_data.tris_select_idx_to_i,

            materials: geom_data.materials
        };
        // console.log(data);
        return data;
    }
       /**
     * Create the buffer for threejs triangles
     */
    private _createTrisBuffGeom(
            tris_i: number[],
            coords_buff_attrib: THREE.BufferAttribute,
            colors_buff_attrib: THREE.BufferAttribute,
            normals_buff_attrib: THREE.BufferAttribute,
            material_groups): THREE.BufferGeometry {
        const tris_geom_buff = new THREE.BufferGeometry();
        tris_geom_buff.setIndex( tris_i );
        tris_geom_buff.setAttribute('position', coords_buff_attrib );
        tris_geom_buff.setAttribute('color', colors_buff_attrib );
        if (normals_buff_attrib !== null) { tris_geom_buff.setAttribute('normal', normals_buff_attrib ); }
        tris_geom_buff.clearGroups();
        material_groups.forEach(element => {
            tris_geom_buff.addGroup(element[0], element[1], element[2]);
        });
        return tris_geom_buff;
    }
    /**
     * Create the buff geom for threejs lines
     */
    private _createLinesBuffGeom(
            lines_i: number[],
            coords_buff_attrib: THREE.BufferAttribute,
            colors_buff_attrib: THREE.BufferAttribute): THREE.BufferGeometry {
        const lines_buff_geom = new THREE.BufferGeometry();
        lines_buff_geom.setIndex( lines_i );
        lines_buff_geom.setAttribute('position', coords_buff_attrib );
        lines_buff_geom.setAttribute('color', colors_buff_attrib );
        return lines_buff_geom;
    }
    /**
     * Create the points buffer geom for threejs points
     */
    private _createPointsBuffGeom(
            points_i: number[],
            coords_buff_attrib: THREE.BufferAttribute,
            colors_buff_attrib: THREE.BufferAttribute): THREE.BufferGeometry {
        const points_buff_geom = new THREE.BufferGeometry();
        points_buff_geom.setIndex( points_i );
        points_buff_geom.setAttribute('position', coords_buff_attrib );
        points_buff_geom.setAttribute('color', colors_buff_attrib );
        return points_buff_geom;
    }
    /**
     * Create the geom buffer for threejs positions
     */
    private _createPosisBuffGeom(
            points_i: number[],
            coords_buff_attrib: THREE.BufferAttribute): THREE.BufferGeometry {
        const posis_geom_buff = new THREE.BufferGeometry();
        posis_geom_buff.setIndex( points_i );
        posis_geom_buff.setAttribute('position', coords_buff_attrib );
        return posis_geom_buff;
    }
}
