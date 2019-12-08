
import {  IGeomArrays, TWire, TColl } from '../../common';
import { GIGeom } from '../Geom';

/**
 * Class for interacting with the core data.
 *
 * The data conssists of a set of sparse arrays.
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
export class GIGeomCore {
    protected geom: GIGeom;
    protected _geom_arrays: IGeomArrays;
    /**
     * Constructor
     */
    constructor(geom: GIGeom, geom_arrays: IGeomArrays) {
        this.geom = geom;
        this._geom_arrays = geom_arrays;
    }
    // ============================================================================
    // Utility methods
    // ============================================================================
    // single value
    protected _set(arr: any[], arr_idxs: number|number[], item: number): void {
        if (!Array.isArray(arr_idxs)) {
            arr[arr_idxs] = item;
        } else {
            arr_idxs.forEach( arr_idx => this._set(arr, arr_idx, item) );
        }
    }
    protected _clear(arr: any[], arr_idxs: number|number[], del: boolean): void {
        if (!Array.isArray(arr_idxs)) {
            if (del) {
                delete arr[arr_idxs];
            } else {
                arr[arr_idxs] = null;
            }
        } else {
            arr_idxs.forEach( arr_idx => this._clear(arr, arr_idx, del) );
        }
    }
    protected _clearIf(arr: any[], arr_idxs: number|number[], val: number, del: boolean): void {
        if (!Array.isArray(arr_idxs)) {
            if (arr[arr_idxs] === val) {
                if (del) {
                    delete arr[arr_idxs];
                } else {
                    arr[arr_idxs] = null;
                }
            }
        } else {
            arr_idxs.forEach( arr_idx => this._clear(arr, arr_idx, del) );
        }
    }
    // set of unique values, stored as arrays
    protected _addToSet(arr: any[], arr_idxs: number|number[], item: number): void {
        if (item === undefined) { return; }
        if (!Array.isArray(arr_idxs)) {
            if (!arr[arr_idxs]) { arr[arr_idxs] = []; }
            if (arr[arr_idxs].indexOf(item) === -1) { arr[arr_idxs].push(item); }
        } else {
            arr_idxs.forEach( arr_idx => this._addToSet(arr, arr_idx, item) );
        }
    }
    protected _remFromSet(arr: any[], arr_idxs: number|number[], item: number, del: boolean): void {
        if (item === undefined) { return; }
        if (!Array.isArray(arr_idxs)) {
            const idx: number = arr[arr_idxs].indexOf(item);
            if (idx === -1) { return; }
            arr[arr_idxs].splice(idx, 1);
            if (del && arr[arr_idxs].length === 0) {
                delete arr[arr_idxs];
            }
        } else {
            arr_idxs.forEach( arr_idx => this._remFromSet(arr, arr_idx, item, del) );
        }
    }
    // arrays of values
    protected _appToArr(arr: any[], arr_idxs: number|number[], item: number): void {
        if (!Array.isArray(arr_idxs)) {
            if (!arr[arr_idxs]) { arr[arr_idxs] = []; }
            arr[arr_idxs].push(item);
        } else {
            arr_idxs.forEach( arr_idx => this._appToArr(arr, arr_idx, item) );
        }
    }
    protected _insToArr(arr: any[], arr_idxs: number|number[], item: number, idx: number): void {
        if (!Array.isArray(arr_idxs)) {
            if (!arr[arr_idxs]) { arr[arr_idxs] = []; }
            arr[arr_idxs][idx] = item;
        } else {
            arr_idxs.forEach( arr_idx => this._insToArr(arr, arr_idx, item, idx) );
        }
    }
    protected _remFromArr(arr: any[], arr_idxs: number|number[], idx: number, del: boolean): void {
        if (!Array.isArray(arr_idxs)) {
            if (!arr[arr_idxs]) { arr[arr_idxs] = []; }
            if (del) {
                delete arr[arr_idxs][idx];
            } else {
                arr[arr_idxs][idx] = null;
            }
        } else {
            arr_idxs.forEach( arr_idx => this._remFromArr(arr, arr_idx, idx, del) );
        }
    }
    protected _remFromArrIf(arr: any[], arr_idxs: number|number[], idx: number, val: number, del: boolean): void {
        if (!Array.isArray(arr_idxs)) {
            if (!arr[arr_idxs]) { arr[arr_idxs] = []; }
            if (arr[arr_idxs][idx] === val) {
                if (del) {
                    delete arr[arr_idxs][idx];
                } else {
                    arr[arr_idxs][idx] = null;
                }
            }
        } else {
            arr_idxs.forEach( arr_idx => this._remFromArr(arr, arr_idx, idx, del) );
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
        for (const edge_i of edges_i) {
        }
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
    public isCollDescendent(coll1_i: number, coll2_i: number): boolean {
        let parent_coll_i: number = this._geom_arrays.dn_colls_objs[coll1_i][0][0];
        while (parent_coll_i !== undefined) {
            if (parent_coll_i === coll2_i) { return true; }
            parent_coll_i = this._geom_arrays.dn_colls_objs[parent_coll_i][0][0];
        }
        return false;
    }
    /**
     * Get the children collections of a collection.
     */
    public collGetChildren(coll_i: number): number[] {
        const children: number[] = [];
        for (let i = 0; i < this._geom_arrays.dn_colls_objs.length; i++) {
            const coll: TColl = this._geom_arrays.dn_colls_objs[i];
            if (coll !== null && coll[0][0] === coll_i) {
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
        for (let i = 0; i < this._geom_arrays.dn_colls_objs.length; i++) {
            if (i === coll_i) { continue; }
            const coll: TColl = this._geom_arrays.dn_colls_objs[i];
            if (coll !== null && coll[0][0] !== undefined) {
                if (this.isCollDescendent(i, coll_i)) {
                    descendent_colls_i.push(i);
                }
            }
        }
        return descendent_colls_i;
    }
}
