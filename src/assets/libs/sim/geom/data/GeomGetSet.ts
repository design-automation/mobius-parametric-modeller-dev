import { IGeomData, IGeomArrays } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Get and set the data in this model.
 *
 */
export class GeomGetSet extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    /**
     * Returns the geom data for this model.
     */
    public getData(): IGeomArrays {
        // clone the data
        const cloned_data: IGeomArrays = Object.assign({}, this._geom_arrays);
        for (const key of Object.keys(cloned_data)) {
            cloned_data[key] =  cloneArr(this._geom_arrays[key]);
        }
        // return the cloned data
        return cloned_data;
    }
    /**
     * Sets the geom data for this model.
     * Any existing data in the model is deleted.
     * @param geom_data The data to be set.
     */
    public setData(geom_data: IGeomArrays): void {
        this._geom_arrays = geom_data;
    }
    /**
     * Returns the geom data for this model as json data (undef replaced with neg numbers).
     */
    public getJsonData(): IGeomArrays {
        // clone the data
        const json_data: IGeomArrays = Object.assign({}, this._geom_arrays); // clone shallow
        for (const key of Object.keys(json_data)) {
            json_data[key] =  encodeArr(cloneArr(this._geom_arrays[key]));

        }
        // return the cloned data
        return json_data;
    }
    /**
     * Sets the geom data for this model from json data (undef replaced with neg numbers).
     * Any existing data in the model is deleted.
     */
    public setJsonData(geom_data: IGeomArrays): void {
        // clone the data
        for (const key of Object.keys(this._geom_arrays)) {
            this._geom_arrays[key] =  decodeArr(cloneArr(geom_data[key]));
        }
    }
}

// this is a temporary fix to clone the data
// will later be replaced by typed arrays
/**
 * Clones an array
 * @param arr
 */
function cloneArr(arr: any) {
    if (!Array.isArray(arr)) { return arr; }
    return arr.map( item => cloneArr(item) );
}
/**
 * Encodes an array by replacing undef with neg numbers
 * @param arr
 */
function encodeArr(arr: any): any[] {
    const new_arr: any[] = [];
    let undef_count = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === undefined) {
            undef_count--;
            if (undef_count === -1) {
                new_arr.push(undef_count);
            } else {
                new_arr[new_arr.length - 1] = undef_count;
            }
        } else {
            undef_count = 0;
            new_arr.push(arr[i]);
        }
    }
    return new_arr;
}
/**
 * Decodes an array by replacing neg numbers with undefined
 * @param arr
 */
function decodeArr(arr: any): any[] {
    const new_arr: any[] = [];
    let idx_count = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < 0) {
            for (let j = arr[i]; j < 0; j++) {
                idx_count++;
            }
        } else {
            new_arr[idx_count] = arr[i];
        }
    }
    return new_arr;
}
    // /**
    //  * Returns the data for this model.
    //  */
    // public getData2(): IGeomData {
    //     // TODO this copies the data, which is not necessary
    //     function replUndef(in_arr: any[]): any[] {
    //         const out_arr: any[] = [];
    //         for (let i = 0; i < in_arr.length; i++) {
    //             if (in_arr[i] === undefined) {
    //                 out_arr[i] = null;
    //             } else {
    //                 out_arr[i] = in_arr[i];
    //             }
    //         }
    //         return out_arr;
    //     }
    //     return {
    //         num_posis: this._geom_arrays.up_posis_verts.length,
    //         verts: replUndef(this._geom_arrays.dn_verts_posis),
    //         tris: replUndef(this._geom_arrays.dn_tris_verts),
    //         edges: replUndef(this._geom_arrays.dn_edges_verts),
    //         wires: replUndef(this._geom_arrays.dn_wires_edges),
    //         faces_tris: replUndef(this._geom_arrays.dn_faces_tris),
    //         faces_wires: replUndef(this._geom_arrays.dn_faces_wires),
    //         points: replUndef(this._geom_arrays.dn_points_verts),
    //         plines: replUndef(this._geom_arrays.dn_plines_wires),
    //         pgons: replUndef(this._geom_arrays.dn_pgons_faces),
    //         coll_points: replUndef(this._geom_arrays.dn_colls_points),
    //         coll_plines: replUndef(this._geom_arrays.dn_colls_plines),
    //         coll_pgons: replUndef(this._geom_arrays.dn_colls_pgons),
    //         coll_parents: replUndef(this._geom_arrays.up_colls_parents),
    //         selected: this.geom.selected
    //     };
    // }
    // /**
    //  * Sets the data in this model.
    //  * Any existing data in the model is deleted.
    //  * @param geom_data The data to be set.
    //  */
    // public setData2(geom_data: IGeomData): void {
    //     // TODO this copies the data, which is not necessary
    //     function replNull(in_arr: any[]): any[] {
    //         const out_arr: any[] = [];
    //         for (let i = 0; i < in_arr.length; i++) {
    //             if (in_arr[i] !== null) { out_arr[i] = in_arr[i]; }
    //         }
    //         return out_arr;
    //     }
    //     // update the down arrays
    //     this._geom_arrays.dn_verts_posis =  replNull(geom_data.verts);
    //     this._geom_arrays.dn_tris_verts =  replNull(geom_data.tris);
    //     this._geom_arrays.dn_edges_verts = replNull(geom_data.edges);
    //     this._geom_arrays.dn_wires_edges = replNull(geom_data.wires);
    //     this._geom_arrays.dn_faces_tris = replNull(geom_data.faces_tris);
    //     this._geom_arrays.dn_faces_wires = replNull(geom_data.faces_wires);
    //     this._geom_arrays.dn_points_verts = replNull(geom_data.points);
    //     this._geom_arrays.dn_plines_wires = replNull(geom_data.plines);
    //     this._geom_arrays.dn_pgons_faces = replNull(geom_data.pgons);
    //     this._geom_arrays.up_colls_parents = replNull(geom_data.coll_parents);
    //     this._geom_arrays.dn_colls_points = replNull(geom_data.coll_points);
    //     this._geom_arrays.dn_colls_plines = replNull(geom_data.coll_plines);
    //     this._geom_arrays.dn_colls_pgons = replNull(geom_data.coll_pgons);
    //     // set selected
    //     this.geom.selected = geom_data.selected;

    //     // update the up arrays
    //     // many of the values will be undefined
    //     // they could also be undefined, since we might have saved some data with deleted ents

    //     // fill up_posis_verts with either null or empty arrays
    //     // the up_posis_verts array is special, it can have no undefine values
    //     // its length is used to determine how many posis there are in the model

    //     // TODO add num_posis

    //     // posis->verts, create arrays
    //     this._geom_arrays.up_posis_verts = [];
    //     for (let posi_i = 0; posi_i < geom_data.num_posis; posi_i++) {
    //         if (this.geom.model.attribs.query.getPosiCoords(posi_i) !== undefined) {
    //             this._geom_arrays.up_posis_verts[posi_i] = [];
    //         }
    //     }
    //     // posis->verts
    //     this._geom_arrays.dn_verts_posis.forEach( (_posi_i, vert_i) => { // val, index
    //         if (_posi_i !== undefined) {
    //             this._geom_arrays.up_posis_verts[_posi_i].push(vert_i);
    //         }
    //     });
    //     // verts->tris, one to many
    //     this._geom_arrays.up_verts_tris = [];
    //     this._geom_arrays.dn_tris_verts.forEach( (vert_i_arr, tri_i) => { // val, index
    //         if (vert_i_arr !== undefined) {
    //             vert_i_arr.forEach( vert_i => {
    //                 if (this._geom_arrays.up_verts_tris[vert_i] === undefined) {
    //                     this._geom_arrays.up_verts_tris[vert_i] = [];
    //                 }
    //                 this._geom_arrays.up_verts_tris[vert_i].push(tri_i);
    //             });
    //         }
    //     });
    //     // verts->edges, one to two
    //     // order is important
    //     this._geom_arrays.up_verts_edges = [];
    //     this._geom_arrays.dn_edges_verts.forEach( (vert_pair_i, edge_i) => { // val, index
    //         if (vert_pair_i !== undefined) {
    //             vert_pair_i.forEach( (vert_i, index) => {
    //                 if (this._geom_arrays.up_verts_edges[vert_i] === undefined) {
    //                     this._geom_arrays.up_verts_edges[vert_i] = [null, null];
    //                 }
    //                 if (index === 0) {
    //                     this._geom_arrays.up_verts_edges[vert_i][1] = edge_i;
    //                 } else if (index === 1) {
    //                     this._geom_arrays.up_verts_edges[vert_i][0] = edge_i;
    //                 }
    //                 if (index > 1) {
    //                     throw new Error('Import data error: Found an edge with more than two vertices.');
    //                 }
    //             });
    //         }
    //     });
    //     // edges->wires
    //     this._geom_arrays.up_edges_wires = [];
    //     this._geom_arrays.dn_wires_edges.forEach( (edge_i_arr, wire_i) => { // val, index
    //         if (edge_i_arr !== undefined) {
    //             edge_i_arr.forEach( edge_i => {
    //                 this._geom_arrays.up_edges_wires[edge_i] = wire_i;
    //             });
    //         }
    //     });
    //     // wires->faces
    //     this._geom_arrays.up_wires_faces = [];
    //     this._geom_arrays.up_tris_faces = [];
    //     this._geom_arrays.dn_faces_wires.forEach( (face_wires, face_i) => { // val, index
    //         if (face_wires !== undefined) {
    //             face_wires.forEach( wire_i => {
    //                 this._geom_arrays.up_wires_faces[wire_i] = face_i;
    //             });
    //         }
    //     });
    //     // tris->faces
    //     this._geom_arrays.up_wires_faces = [];
    //     this._geom_arrays.up_tris_faces = [];
    //     this._geom_arrays.dn_faces_tris.forEach( (face_tris, face_i) => { // val, index
    //         if (face_tris !== undefined) {
    //             face_tris.forEach( tri_i => {
    //                 this._geom_arrays.up_tris_faces[tri_i] = face_i;
    //             });
    //         }
    //     });
    //     // points, lines, polygons
    //     this._geom_arrays.up_verts_points = [];
    //     this._geom_arrays.dn_points_verts.forEach( (vert_i, point_i) => { // val, index
    //         if (vert_i !== undefined) {
    //             this._geom_arrays.up_verts_points[vert_i] = point_i;
    //         }
    //     });
    //     this._geom_arrays.up_wires_plines = [];
    //     this._geom_arrays.dn_plines_wires.forEach( (wire_i, line_i) => { // val, index
    //         if (wire_i !== undefined) {
    //             this._geom_arrays.up_wires_plines[wire_i] = line_i;
    //         }
    //     });
    //     this._geom_arrays.up_faces_pgons = [];
    //     this._geom_arrays.dn_pgons_faces.forEach( (face_i, pgon_i) => { // val, index
    //         if (face_i !== undefined) {
    //             this._geom_arrays.up_faces_pgons[face_i] = pgon_i;
    //         }
    //     });
    //     // collections of points, polylines, polygons
    //     this._geom_arrays.up_points_colls = [];
    //     this._geom_arrays.up_plines_colls = [];
    //     this._geom_arrays.up_pgons_colls = [];
    //     // TODO put these all in one loop
    //     this._geom_arrays.dn_colls_points.forEach( (coll_points, coll_i) => { // val, index
    //         if (coll_points !== undefined) {
    //             coll_points.forEach( point_i => {
    //                 if (this._geom_arrays.up_points_colls[point_i] === undefined) {
    //                     this._geom_arrays.up_points_colls[point_i] = [coll_i];
    //                 } else {
    //                     this._geom_arrays.up_points_colls[point_i].push(coll_i);
    //                 }
    //             });
    //         }
    //     });
    //     this._geom_arrays.dn_colls_plines.forEach( (coll_plines, coll_i) => { // val, index
    //         if (coll_plines !== undefined) {
    //             coll_plines.forEach( pline_i => {
    //                 if (this._geom_arrays.up_plines_colls[pline_i] === undefined) {
    //                     this._geom_arrays.up_plines_colls[pline_i] = [coll_i];
    //                 } else {
    //                     this._geom_arrays.up_plines_colls[pline_i].push(coll_i);
    //                 }
    //             });
    //         }
    //     });
    //     this._geom_arrays.dn_colls_pgons.forEach( (coll_plines, coll_i) => { // val, index
    //         if (coll_plines !== undefined) {
    //             coll_plines.forEach( pgon_i => {
    //                 if (this._geom_arrays.up_pgons_colls[pgon_i] === undefined) {
    //                     this._geom_arrays.up_pgons_colls[pgon_i] = [coll_i];
    //                 } else {
    //                     this._geom_arrays.up_pgons_colls[pgon_i].push(coll_i);
    //                 }
    //             });
    //         }
    //     });
    // }
// }
