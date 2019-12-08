import { IGeomArrays, TEdge, TWire, TFace, TTri } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Reversing edges, wire, and faces
 *
 */
export class GeomRev extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom, geom_arrays: IGeomArrays) {
        super(geom, geom_arrays);
    }
    /**
     * Reverse an edge
     */
    public edgeReverse(edge_i: number): void {
        const edge: TEdge = this._geom_arrays.dn_edges_verts[edge_i];
        edge.reverse();
        // the verts pointing up to edges also need to be reversed
        const edges_i: [number[], number[]] = this._geom_arrays.up_verts_edges[edge[0]];
        edges_i.reverse();
    }
    /**
     * Reverse a wire
     */
    public wireReverse(wire_i: number): void {
        const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
        wire.reverse();
        // reverse the edges
        for (const edge_i of wire) {
            this.edgeReverse(edge_i);
        }
    }
    /**
     * Reverse a face
     */
    public faceReverse(face_i: number): void {
        const face: TFace = this._geom_arrays.dn_faces_wirestris[face_i];
        // reverse the edges
        for (const wire_i of face[0]) {
            this.wireReverse(wire_i);
        }
        // reverse the triangles
        for (const tri_i of face[1]) {
            const tri: TTri = this._geom_arrays.dn_tris_verts[tri_i];
            tri.reverse();
        }
    }
}
