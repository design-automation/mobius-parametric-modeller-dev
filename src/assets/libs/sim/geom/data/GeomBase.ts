
import {  IGeomArrays, TWire, TColl, TCollParent } from '../../common';
import { Geom } from '../Geom';

/**
 * The base class for the geometry data..
 *
 * The data consists of a set of sparse arrays.
 *
 * Posis are stored in the up_posis_verts array.
 * The up_posis_verts array must contain an entry for each posi that is not deleted.
 * If there are no vertices using the a posi, then the posi must have a [] value.
 *
 * Vertices are stored in the dn_verts_posis array.
 * For vertices, they must always have an array of length 2.
 * Each vertex has an in-edge and an out edge.
 * For a vertex at the start of a open wire, the array will be [null, start_posi_i].
 * For a vertex at the end of a open wire, the array will be [end_posi_i, null].
 *
 * Edges are stored in the dn_edges_verts array.
 * For edges, they must always have an array of length 2 since every edge must have.
 * exactly two vertices.
 *
 * Triangles are stored in the dn_tris_verts array.
 * Note that triangles are mostly hoddent from the user.
 *
 */
export class GeomBase {
    protected geom: Geom;
    //  all arrays
    protected _geom_arrays: IGeomArrays = {
        // down
        dn_verts_posis: [],  // flat array
        dn_tris_verts: [],   // reg nested array
        dn_edges_verts: [],  // reg nested array
        dn_wires_edges: [],  // irreg nested array
        dn_faces_tris: [],   // irreg nested array
        dn_faces_wires: [],  // irreg nested array
        dn_points_verts: [], // flat array
        dn_plines_wires: [], // flat array
        dn_pgons_faces: [],  // flat array
        dn_colls_points: [], // irreg nested array
        dn_colls_plines: [], // irreg nested array
        dn_colls_pgons: [],  // irreg nested array
        // up
        up_posis_verts: [],  // irreg nested array
        up_tris_faces: [],   // flat array
        up_verts_edges: [],  // reg nested array
        up_verts_tris: [],   // irreg nested array
        up_verts_points: [], // flat array
        up_edges_wires: [],  // flat array
        up_wires_faces: [],  // flat array
        up_wires_plines: [], // flat array
        up_faces_pgons: [],  // flat array
        up_points_colls: [], // irreg nested array
        up_plines_colls: [], // irreg nested array
        up_pgons_colls: [],  // irreg nested array
        up_colls_parents: [] // flat array
    };
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        this.geom = geom;
    }
    // ============================================================================
    // Utility methods
    // ============================================================================
    // single value
    /**
     * Set values in an array, given a list of indexes
     * @param arr The array
     * @param val_idxs The list of indexes
     * @param val The value
     */
    protected _setValsInArr(arr: any[], val_idxs: number|number[], val: number): void {
        if (!Array.isArray(val_idxs)) {
            arr[val_idxs] = val;
        } else {
            val_idxs.forEach( val_idx => this._setValsInArr(arr, val_idx, val) );
        }
    }
    /**
     * Clear values in an array, given a list of indexes.
     * Either delete or set to null.
     * @param arr The array
     * @param val_idxs The list of indexes
     * @param del Delete or set to null.
     */
    protected _clearValsInArr(arr: any[], val_idxs: number|number[], del: boolean): void {
        if (!Array.isArray(val_idxs)) {
            if (del) {
                delete arr[val_idxs];
            } else {
                arr[val_idxs] = undefined;
            }
        } else {
            val_idxs.forEach( val_idx => this._clearValsInArr(arr, val_idx, del) );
        }
    }
    /**
     * Clear values in an array, given a list of indexes, and only if teh current value is equal to val.
     * Either delete or set to null.
     * @param arr The array
     * @param val_idxs The list of indexes
     * @param current_val The existing value
     * @param del Delete or set to null.
     */
    protected _clearValsInArrIf(arr: any[], val_idxs: number|number[], current_val: number, del: boolean): void {
        if (!Array.isArray(val_idxs)) {
            if (arr[val_idxs] === current_val) {
                if (del) {
                    delete arr[val_idxs];
                } else {
                    arr[val_idxs] = null;
                }
            }
        } else {
            val_idxs.forEach( val_idx => this._clearValsInArr(arr, val_idx, del) );
        }
    }
    // set of unique values, stored as arrays
    /**
     * Add a value to a sub-array in a container array, if it is not already in the array.
     * @param cont_arr The container array.
     * @param set_idxs The sub-array indexes.
     * @param val The value to add.
     */
    protected _addValToSetInArr(cont_arr: any[], set_idxs: number|number[], val: number): void {
        if (val === undefined) { return; }
        if (!Array.isArray(set_idxs)) {
            if (!cont_arr[set_idxs]) { cont_arr[set_idxs] = []; }
            if (cont_arr[set_idxs].indexOf(val) === -1) { cont_arr[set_idxs].push(val); }
        } else {
            set_idxs.forEach( set_idx => this._addValToSetInArr(cont_arr, set_idx, val) );
        }
    }
    /**
     * Remove a value from a sub-array in a container array.
     * @param cont_arr The container array.
     * @param set_idxs The sub-array indexes.
     * @param val The value to remove.
     * @param del Delete or set to null.
     */
    protected _remValFromSetInArr(cont_arr: any[], set_idxs: number|number[], val: number, del: boolean): void {
        if (val === undefined) { return; }
        if (!Array.isArray(set_idxs)) {
            const idx: number = cont_arr[set_idxs].indexOf(val);
            if (idx === -1) { return; }
            cont_arr[set_idxs].splice(idx, 1);
            if (del && cont_arr[set_idxs].length === 0) {
                delete cont_arr[set_idxs];
            }
        } else {
            set_idxs.forEach( set_idx => this._remValFromSetInArr(cont_arr, set_idx, val, del) );
        }
    }
    // arrays of values
    /**
     * Appends a value to a sub-array in a container array.
     * @param cont_arr The container array.
     * @param sub_arr_idxs The indexes to the sub-arrays.
     * @param val The value.
     */
    protected _appendValToSubArr(cont_arr: any[], sub_arr_idxs: number|number[], val: number): void {
        if (!Array.isArray(sub_arr_idxs)) {
            if (!cont_arr[sub_arr_idxs]) { cont_arr[sub_arr_idxs] = []; }
            cont_arr[sub_arr_idxs].push(val);
        } else {
            sub_arr_idxs.forEach( sub_arr_idx => this._appendValToSubArr(cont_arr, sub_arr_idx, val) );
        }
    }
    /**
     * Set a value in one or more sub-arrays in a container array, given an index.
     * @param cont_arr The container array.
     * @param sub_arr_idxs The indexes to the sub-arrays.
     * @param val The value.
     * @param val_idx The value index.
     */
    protected _setValInSubArr(cont_arr: any[], sub_arr_idxs: number|number[], val_idx: number, val: number): void {
        if (!Array.isArray(sub_arr_idxs)) {
            if (!cont_arr[sub_arr_idxs]) { cont_arr[sub_arr_idxs] = []; }
            cont_arr[sub_arr_idxs][val_idx] = val;
        } else {
            sub_arr_idxs.forEach( sub_arr_idx => this._setValInSubArr(cont_arr, sub_arr_idx, val_idx, val) );
        }
    }
    /**
     * Remove a value from one or more sub-arrays in a container array, given an index.
     * Delete or set to null.
     * @param cont_arr The container array.
     * @param sub_arr_idxs The indexes to the sub-arrays.
     * @param val_idx The index in the sub-arrays.
     * @param del Delete or set to null.
     */
    protected _remValFromSubArr(cont_arr: any[], sub_arr_idxs: number|number[], val_idx: number, del: boolean): void {
        if (!Array.isArray(sub_arr_idxs)) {
            if (!cont_arr[sub_arr_idxs]) { cont_arr[sub_arr_idxs] = []; }
            if (del) {
                delete cont_arr[sub_arr_idxs][val_idx];
            } else {
                cont_arr[sub_arr_idxs][val_idx] = null;
            }
        } else {
            sub_arr_idxs.forEach( sub_arr_idx => this._remValFromSubArr(cont_arr, sub_arr_idx, val_idx, del) );
        }
    }
    /**
     * 
     * Delete or set to null/
     * @param cont_arr The container array.
     * @param sub_arr_idxs The indexes to the sub-arrays.
     * @param val_idx The index in the sub-arrays.
     * @param current_val The current value.
     * @param del Delete or set to null.
     */
    protected _remValFromSubArrIf(cont_arr: any[], sub_arr_idxs: number|number[], val_idx: number, 
            current_val: number, del: boolean): void {
        if (!Array.isArray(sub_arr_idxs)) {
            if (!cont_arr[sub_arr_idxs]) { cont_arr[sub_arr_idxs] = []; }
            if (cont_arr[sub_arr_idxs][val_idx] === current_val) {
                if (del) {
                    delete cont_arr[sub_arr_idxs][val_idx];
                } else {
                    cont_arr[sub_arr_idxs][val_idx] = null;
                }
            }
        } else {
            sub_arr_idxs.forEach( sub_arr_idx => this._remValFromSubArr(cont_arr, sub_arr_idx, val_idx, del) );
        }
    }
    // ============================================================================
    // Base methods required by sub-classes
    // ============================================================================
    /**
     * Check if a wire is closed
     */
    public wireIsCLosed(wire_i: number): boolean {
        const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
        return this._geom_arrays.dn_edges_verts[wire[0]][0] !== undefined;
    }
    /**
     * Get the vertices of a wire
     */
    public wireGetVerts(wire_i: number): number[] {
        const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
        if (this.wireIsCLosed(wire_i)) {
            return edges_i.map(edge_i => this._geom_arrays.dn_edges_verts[edge_i][0]);
        } else {
            const verts_i: number[] = [];
            for (let i = 0; i < edges_i.length - 1; i++) {
                verts_i.push( this._geom_arrays.dn_edges_verts[edges_i[i]][1] );
            }
            verts_i.push( this._geom_arrays.dn_edges_verts[edges_i[edges_i.length - 1]][0] );
            return verts_i;
        }
    }
    /**
     * Returns true if the first coll is a descendent of the second coll.
     */
    public collIsDescendent(coll1_i: number, coll2_i: number): boolean {
        let coll_parent: TCollParent = this._geom_arrays.up_colls_parents[coll1_i];
        while (coll_parent !== undefined && coll_parent !== null) {
            if (coll_parent !== undefined && coll_parent !== null && coll_parent === coll2_i) { return true; }
            coll_parent = this._geom_arrays.up_colls_parents[coll_parent];
        }
        return false;
    }
    /**
     * Get the children collections of a collection.
     */
    public collGetChildren(coll_i: number): number[] {
        const children: number[] = [];
        for (let i = 0; i < this._geom_arrays.up_colls_parents.length; i++) {
            const coll_parent: TCollParent = this._geom_arrays.up_colls_parents[i];
            if (coll_parent !== undefined && coll_parent !== null && coll_parent === coll_i) {
                children.push(i);
            }
        }
        return children;
    }
    /**
     * Get the descendent collections of a collection.
     */
    public collGetDescendents(coll_i: number): number[] {
        const descendent_colls_i: number[] = [];
        for (let i = 0; i < this._geom_arrays.up_colls_parents.length; i++) {
            if (i === coll_i) { continue; }
            const coll_parent: TCollParent = this._geom_arrays.up_colls_parents[i];
            if (coll_parent !== undefined && coll_parent !== null) {
                if (this.collIsDescendent(i, coll_i)) {
                    descendent_colls_i.push(i);
                }
            }
        }
        return descendent_colls_i;
    }
}
