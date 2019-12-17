import { ITjsData, ITjsMaterial } from './common';
import { SIModel } from './SIModel';
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
    // /**
    //  * Generate a default color if none exists.
    //  */
    // private _generateColors(): number[] {
    //     const colors = [];
    //     const numEnts = this._model.geom.data.numEnts(EEntType.VERT, false);
    //     for (let index = 0; index < numEnts; index++) {
    //         colors.push(1, 1, 1);
    //     }
    //     return colors;
    // }
    // /**
    //  * Generate default normals if non exist.
    //  */
    // private _generateNormals(): number[] {
    //     const normals = [];
    //     const numEnts = this.geom.data.numEnts(EEntType.VERT, false);
    //     for (let index = 0; index < numEnts; index++) {
    //         normals.push(0, 0, 0);
    //     }
    //     return normals;
    // }
    /**
     * Returns arrays for visualization in Threejs.
     */
    public get3jsData(): ITjsData {
        // get the attribs at the vertex level
        const [posis_xyz, posis_map]: [number[], Map<number, number>]  =  this._model.attribs.threejs.get3jsSeqPosisCoords();
        const [vertex_xyz, vertex_map]: [number[], Map<number, number>]  =  this._model.attribs.threejs.get3jsSeqVertsCoords();
        const normals_values: number[] = this._model.attribs.threejs.get3jsSeqVertsNormal();
        const colors_values: number[] = this._model.attribs.threejs.get3jsSeqVertsColor();
        // add normals and colours
        // if (!normals_values) {
        //     normals_values = this._generateNormals();
        // }
        // if (!colors_values) {
        //     colors_values = this._generateColors();
        // }
        // get posi indices
        const posis_indices: number[] = Array.from(posis_map.values());
        // get the indices of the vertices for edges, points and triangles
        const [tris_verts_i, triangle_select_map, materials, material_groups]:
            [number[], Map<number, number>, ITjsMaterial[], [number, number, number][]] = this._model.geom.threejs.get3jsTris(vertex_map);
        // let c = 0;
        // let str = '';
        // let last = 0;
        // for (const t of tris_verts_i) {
        //     if (c % 3 === 0) {
        //         if (c > 0) {
        //             str += vertex_xyz[last * 3] + ',' + vertex_xyz[last * 3 + 1] + ',' + vertex_xyz[last * 3 + 2]
        //             + ' _SelPolyline _PlanarSrf _Delete';
        //         }
        //         str += '\n_polyline ';
        //         c = 1;
        //         last = t;
        //     } else {
        //         c += 1;
        //     }
        //     str += vertex_xyz[t * 3] + ',' + vertex_xyz[t * 3 + 1] + ',' + vertex_xyz[t * 3 + 2] + ' ';
        // }
        // str += vertex_xyz[last * 3] + ',' + vertex_xyz[last * 3 + 1] + ',' + vertex_xyz[last * 3 + 2] +
        //     ' _SelPolyline _PlanarSrf _Delete'
        // console.log(str);

        const [edges_verts_i, edge_select_map]: [number[], Map<number, number>] = this._model.geom.threejs.get3jsEdges(vertex_map);
        const [points_verts_i, point_select_map]: [number[], Map<number, number>] = this._model.geom.threejs.get3jsPoints(vertex_map);
        // Create buffers that will be used by all geometry
        const verts_xyz_buffer = new THREE.Float32BufferAttribute(vertex_xyz, 3);
        const normals_buffer = new THREE.Float32BufferAttribute(normals_values, 3);
        const colors_buffer = new THREE.Float32BufferAttribute(colors_values, 3);
        const posis_xyz_buffer = new THREE.Float32BufferAttribute(posis_xyz, 3);
        // make the buffers for threejs
        // triangles
        const tris_geom_buff: THREE.BufferGeometry = this._createTrisBuffGeom(
            tris_verts_i, verts_xyz_buffer, colors_buffer, material_groups);
        // lines
        const lines_geom_buff: THREE.BufferGeometry = this._createLinesBuffGeom(
            edges_verts_i, verts_xyz_buffer, normals_buffer);
        // points
        const points_geom_buff: THREE.BufferGeometry = this._createPointsBuffGeom(
            points_verts_i, verts_xyz_buffer, colors_buffer);
        // positions
        const posis_geom_buff: THREE.BufferGeometry = this._createPosisBuffGeom(
            posis_indices, posis_xyz_buffer);
        // return an object containing all the data
        const data: ITjsData = {
            num_posis: posis_indices.length,
            num_points: points_verts_i.length,
            num_lines: edges_verts_i.length / 2,
            num_tris: tris_verts_i.length / 3,
            tris_geom_buff: tris_geom_buff,
            lines_geom_buff: lines_geom_buff,
            points_geom_buff: points_geom_buff,
            posis_geom_buff: posis_geom_buff,
            // posis_xyz: posis_xyz,
            // posis_indices: posis_indices,
            posis_map: posis_map,
            // vertex_xyz: vertex_xyz,
            vertex_map: vertex_map,
            // normals: normals_values,
            // colors: colors_values,
            // point_indices: points_verts_i,
            point_select_map: point_select_map,
            // edge_indices: edges_verts_i,
            edge_select_map: edge_select_map,
            // triangle_indices: tris_verts_i,
            triangle_select_map: triangle_select_map,
            materials: materials,
            // material_groups: material_groups
        };
        // console.log(data);
        return data;
    }
       /**
     * Create the buffer for threejs triangles
     */
    private _createTrisBuffGeom(tris_i: number[],
            posis_buffer: THREE.Float32BufferAttribute,
            colors_buffer: THREE.Float32BufferAttribute,
            material_groups): THREE.BufferGeometry {
        const tris_geom_buff = new THREE.BufferGeometry();
        tris_geom_buff.setIndex(tris_i);
        // geom.addAttribute('position', posis_buffer);
        // // geom.addAttribute('normal', normals_buffer);
        // geom.addAttribute('color', colors_buffer);
        tris_geom_buff.setAttribute('position', posis_buffer);
        // geom.setAttribute('normal', normals_buffer);
        tris_geom_buff.setAttribute('color', colors_buffer);
        tris_geom_buff.clearGroups();
        material_groups.forEach(element => {
            tris_geom_buff.addGroup(element[0], element[1], element[2]);
        });
        return tris_geom_buff;
    }
    /**
     * Create the buff geom for threejs lines
     */
    private _createLinesBuffGeom(lines_i: number[],
            posis_buffer: THREE.Float32BufferAttribute,
            normals_buffer: THREE.Float32BufferAttribute): THREE.BufferGeometry {
        const lines_buff_geom = new THREE.BufferGeometry();
        lines_buff_geom.setIndex(lines_i);
        // geom.addAttribute('position', posis_buffer);
        // geom.addAttribute('normal', normals_buffer);
        lines_buff_geom.setAttribute('position', posis_buffer);
        lines_buff_geom.setAttribute('normal', normals_buffer);
        return lines_buff_geom;
    }
    /**
     * Create the points buffer geom for threejs points
     */
    private _createPointsBuffGeom(points_i: number[],
            posis_buffer: THREE.Float32BufferAttribute,
            colors_buffer: THREE.Float32BufferAttribute): THREE.BufferGeometry {
        const points_buff_geom = new THREE.BufferGeometry();
        points_buff_geom.setIndex(points_i);
        // geom.addAttribute('position', posis_buffer);
        // geom.addAttribute('color', colors_buffer);
        points_buff_geom.setAttribute('position', posis_buffer);
        points_buff_geom.setAttribute('color', colors_buffer);
        return points_buff_geom;
    }
    /**
     * Create the geom buffer for threejs positions
     */
    private _createPosisBuffGeom(points_i: number[], posis_buffer: THREE.Float32BufferAttribute): THREE.BufferGeometry {
        const posis_geom_buff = new THREE.BufferGeometry();
        posis_geom_buff.setIndex(points_i);
        // geom.addAttribute('position', posis_buffer);
        posis_geom_buff.setAttribute('position', posis_buffer);
        return posis_geom_buff;
    }
}
