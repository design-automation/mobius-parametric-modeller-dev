import {  IGeomArrays } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Working with verts.
 *
 */
export class GeomVert extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    // ============================================================================
    // IS / HAS ??? methods, return true/false
    // ============================================================================

    public vertIsPline(vert_i: number): boolean {
        const edges_a_i: [number, number] = this._geom_arrays.up_verts_edges[vert_i];
        const edge_i: number = edges_a_i[0] !== null ? edges_a_i[0] : edges_a_i[1];
        if (edge_i === undefined) { return false; }
        return this._geom_arrays.up_wires_plines[this._geom_arrays.up_edges_wires[edge_i]] !== undefined;
    }
    public vertIsPgon(vert_i: number): boolean {
        const edges_a_i: [number, number] = this._geom_arrays.up_verts_edges[vert_i];
        const edge_i: number = edges_a_i[0] !== null ? edges_a_i[0] : edges_a_i[1];
        if (edge_i === undefined) { return false; }
        return this._geom_arrays.up_wires_faces[this._geom_arrays.up_edges_wires[edge_i]] !== undefined;
    }
    public vertIsEdge(vert_i: number): boolean {
        return this._geom_arrays.up_verts_edges[vert_i] !== undefined;
    }
    public vertIsPoint(vert_i: number): boolean {
        return this._geom_arrays.up_verts_points[vert_i] !== undefined;
    }
}
