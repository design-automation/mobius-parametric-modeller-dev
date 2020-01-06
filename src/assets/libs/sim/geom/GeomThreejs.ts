import { Geom } from './Geom';
import { TTri, TEdge, TPoint, EEntType, ETjsMaterialType, ITjsGeomData } from '../common';
import { AttribMap } from '../attribs/data/AttribMap';
import * as THREE from 'three';
import { ITjsMaterial } from '../common';
import __ from 'underscore';

/**
 * Class for geometry.
 */
export class GeomThreejs {
    private _geom: Geom;
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        this._geom = geom;
    }
    /**
     * Threejs geometry data
     * @param verts_i_to_idx 
     */
    public getTjsSeqGeomData(verts_i_to_idx: number[]): ITjsGeomData {
        const [tris_verts_idx_flat, tris_select_idx_to_i, materials, material_groups] = this.getTjsTris(verts_i_to_idx);
        const [edges_verts_idx_flat, edges_select_idx_to_i] = this.getTjsEdges(verts_i_to_idx);
        const [points_verts_idx_flat, points_select_idx_to_i] = this.getTjsPoints(verts_i_to_idx);
        return {
            // tris
            tris_verts_idx_flat,
            tris_select_idx_to_i,
            materials,
            material_groups,
            // edges
            edges_verts_idx_flat,
            edges_select_idx_to_i,
            // points
            points_verts_idx_flat,
            points_select_idx_to_i
        }
    }
    /**
     * Returns that data required for threejs triangles.
     * 0) the vertices, as a flat array
     * 1) the select map, that maps from the threejs tri indices to the gi model tri indices
     * 2) the materials array, which is an array of objects
     * 3) the material groups array, which is an array of [ start, count, mat_index ]
     */
    private getTjsTris(verts_i_to_idx: number[]): [number[], number[], ITjsMaterial[], [number, number, number][]] {
        const settings = JSON.parse(localStorage.getItem('mpm_settings'));
        // arrays to store threejs data
        const mat_f: object = {
            specular: 0x000000,
            emissive: 0x000000,
            shininess: 0,
            side: THREE.FrontSide,
            wireframe: settings.wireframe.show
        };
        const mat_b: object = {
            specular: 0x000000,
            emissive: 0x000000,
            shininess: 0,
            side: THREE.BackSide,
            wireframe: settings.wireframe.show
        };
        const materials: ITjsMaterial[] = [this._getMaterial( mat_f ), this._getMaterial( mat_b )];
        const material_names:  string[] = ['default_front', 'default_back'];
        // get the material attribute from polygons
        const material_attrib: AttribMap = this._geom.model.attribs._attribs_maps.pg.get('material');
        // loop through all tris
        const tris_i: number[] = this._geom.data.getEnts(EEntType.TRI);
        const mat_to_tri_i_map: Map<string, {tris_i_same_mat: number[], mats: number[]} > = new Map();
        const tri_i_to_verts_idx: TTri[] = [];
        for (const tri_i of tris_i) {
            const tri_verts_i: [number, number, number] =  this._geom.data.navTriToVert(tri_i);
            if (tri_verts_i !== undefined) {
                // get the verts, face and the polygon for this tri
                const new_tri_verts_i: TTri = tri_verts_i.map(v => verts_i_to_idx[v]) as TTri;
                // get the materials for this tri from the polygon
                const mat_idxs: number[] = [];
                if (material_attrib !== undefined) {
                    const tri_face_i: number = this._geom.data.navTriToFace(tri_i);
                    const tri_pgon_i: number = this._geom.data.navFaceToPgon(tri_face_i);
                    const mat_attrib_val: string|string[] = material_attrib.getEntVal(tri_pgon_i) as string|string[];
                    const pgon_mat_names: string[] = (Array.isArray(mat_attrib_val)) ? mat_attrib_val : [mat_attrib_val];
                    for (const pgon_mat_name of pgon_mat_names) {
                        let pgon_mat_index: number = material_names.indexOf(pgon_mat_name);
                        if (pgon_mat_index === -1) {
                            const mat_settings_obj: object = this._geom.model.attribs._attribs_maps.mo.get(pgon_mat_name);
                            if (mat_settings_obj !== undefined) {
                                pgon_mat_index = materials.length;
                                material_names.push(pgon_mat_name);
                                materials.push(this._getMaterial(mat_settings_obj));
                            }
                        }
                        if (pgon_mat_index !== -1) {
                            mat_idxs.push(pgon_mat_index);
                        }
                    }
                }
                if (mat_idxs.length === 0) {
                    mat_idxs.push(0); // default material front
                    mat_idxs.push(1); // default material back
                }
                // add the data
                const mat_key: string = mat_idxs.join('-');
                if (!mat_to_tri_i_map.has(mat_key)) { mat_to_tri_i_map.set(mat_key, {tris_i_same_mat: [], mats: mat_idxs } ); }
                // push the tri onto the mat array
                mat_to_tri_i_map.get(mat_key).tris_i_same_mat.push(tri_i);
                // save the tri verts
                tri_i_to_verts_idx[tri_i] = new_tri_verts_i;
            }
        }
        // loop through the data and create the tris and groups data for threejs
        const tris_idx_to_verts_idx: TTri[] = [];
        const tris_select_idx_to_i: number[] = [];
        const mat_groups_map: Map<number, [number, number][]> = new Map(); // mat_index -> [start, end][]
        // sort the material keys
        const mat_keys: string[] = Array.from( mat_to_tri_i_map.keys() );
        mat_keys.sort();
        // loop
        for (const mat_key of mat_keys) {
            const { tris_i_same_mat, mats } = mat_to_tri_i_map.get(mat_key);
            for (const tri_i of tris_i_same_mat) {
                // save the tri data
                const tjs_i = tris_idx_to_verts_idx.push(tri_i_to_verts_idx[tri_i]) - 1;
                tris_select_idx_to_i[tjs_i] = tri_i;
                // go through all materials for this tri and add save the mat groups data
                for (const mat of mats) {
                    let start_end_arrs: [number, number][] = mat_groups_map.get(mat);
                    if (start_end_arrs === undefined) {
                        start_end_arrs = [[tjs_i, tjs_i]];
                        mat_groups_map.set(mat, start_end_arrs);
                    } else {
                        const start_end: [number, number] = start_end_arrs[start_end_arrs.length - 1];
                        if (tjs_i === start_end[1] + 1) {
                            start_end[1] = tjs_i;
                        } else {
                            start_end_arrs.push([tjs_i, tjs_i]);
                        }
                    }
                }
            }
        }
        // convert the mat_groups_map into the format required for threejs
        // for each material group, we need an array [start, count, mat_index]
        const material_groups: [number, number, number][] = []; // [start, count, mat_index][]
        mat_groups_map.forEach( (start_end_arrs, mat_index) => {
            for (const start_end of start_end_arrs) {
                const start: number = start_end[0];
                const count: number = start_end[1] - start_end[0] + 1;
                material_groups.push( [ start * 3, count * 3, mat_index ] );
            }
        });
        // convert the verts list to a flat array
        const tris_verts_i_flat: number[] = __.flatten(tris_idx_to_verts_idx, true);
        // return the data
        // there are four sets of data that are returns
        return [
            tris_verts_i_flat,       // 0) the vertices, as a flat array
            tris_select_idx_to_i,    // 1) the select map, that maps from the threejs tri indices to the gi model tri indices
            materials,               // 2) the materials array, which is an array of objects
            material_groups          // 3) the material groups array, which is an array of [ start, count, mat_index ]
        ];
    }
    /**
     * Returns a flat list of the sequence of verices for all the edges.
     * This list will be assumed to be in pairs.
     * The indices in the list point to the vertices.
     */
    private getTjsEdges(verts_i_to_idx: number[]): [number[], number[]] {
        const edges_verts_idx_filt: TEdge[] = [];
        const edges_select_idx_to_i: number[] = [];
        const edges_i: number[] = this._geom.data.getEnts(EEntType.EDGE);
        const has_vis = this._geom.model.attribs.query.hasAttrib(EEntType.EDGE, 'visibility');
        for (const edge_i of edges_i) {
            if (!has_vis || this._geom.model.attribs.query.getAttribVal(EEntType.EDGE, 'visibility', edge_i) !== 'hidden') {
                const edge_verts_i: TEdge = this._geom.data.navEdgeToVert(edge_i);
                if (edge_verts_i !== null) {
                    const new_edge_verts_i: TEdge = edge_verts_i.map(v => verts_i_to_idx[v]) as TEdge;
                    const tjs_i = edges_verts_idx_filt.push(new_edge_verts_i) - 1;
                    edges_select_idx_to_i[tjs_i] = edge_i;
                }
            }
        }
        return [__.flatten(edges_verts_idx_filt, true), edges_select_idx_to_i];
    }
    /**
     * Returns a flat list of the sequence of verices for all the points.
     * The indices in the list point to the vertices.
     */
    private getTjsPoints(verts_i_to_idx: number[]): [number[], number[]] {
        const points_verts_idx_filt: TPoint[] = [];
        const points_select_idx_to_i: number[] = [];
        const points_i: number[] = this._geom.data.getEnts(EEntType.POINT);
        for (const point_i of points_i) {
            const point_verts_i: TPoint = this._geom.data.navPointToVert(point_i);
            if (point_verts_i !== undefined) {
                const new_point_verts_i: TPoint = verts_i_to_idx[point_verts_i] as TPoint;
                const tjs_i = points_verts_idx_filt.push(new_point_verts_i) - 1;
                points_select_idx_to_i[tjs_i] = point_i;
            }
        }
        return [points_verts_idx_filt, points_select_idx_to_i];
    }

    /**
     * Create a threejs material
     * @param settings
     */
    private _getMaterial(settings?: object): ITjsMaterial {
        const material: ITjsMaterial =  {
            type: ETjsMaterialType.MeshPhongMaterial,
            side: THREE.DoubleSide,
            vertexColors: THREE.VertexColors
        };
        if (settings) {
            for (const key of Object.keys(settings)) {
                material[key] = settings[key];
            }
        }
        return material;
    }
}
