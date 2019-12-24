import { TWire, TFaceWires } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Working with wires.
 *
 */
export class GeomWire extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    public wireIsFace(wire_i: number): boolean {
        return this._geom_arrays.up_wires_plines[wire_i] === undefined;
    }
    public wireIsPline(wire_i: number): boolean {
        return this._geom_arrays.up_wires_plines[wire_i] !== undefined;
    }
    public wireIsHole(wire_i: number): boolean {
        const face_i: number = this._geom_arrays.up_wires_faces[wire_i];
        if (face_i === undefined) { return false; }
        const face_wires: TFaceWires = this._geom_arrays.dn_faces_wires[face_i];
        return face_wires.indexOf(wire_i) > 0;
    }
    /**
     * Check if a wire is closed.
     * @param wire_i
     */
    public wireIsClosed(wire_i: number): boolean {
        const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
        return this._geom_arrays.dn_edges_verts[wire[0]][0] !== undefined;
        // const start_vert_i: number = this._geom_arrays.dn_edges_verts[wire[0]][0];
        // if (start_vert_i === undefined) { return false; }
        // const end_vert_i: number =   this._geom_arrays.dn_edges_verts[wire[wire.length - 1]][1];
        // if (start_vert_i === undefined) { return false; }
        // return (start_vert_i === end_vert_i);
    }
    public wireIsOpen(wire_i: number): boolean {
        return !this.wireIsClosed(wire_i);
    }
    /**
     * Gets the next edge in a wire.
     *
     * If the wire is open, and we are at the last wdge, return null.
     *
     * If the wire is closed and we are at the last edge, return the first edge.
     */
    public wireGetNextEdge(wire_i: number, edge_i: number): number {
        const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
        const idx_edge: number = edges_i.indexOf(edge_i);
        if (idx_edge === -1) { throw new Error('Error finding next edge. The edge is not in the wire.'); }
        if (idx_edge < edges_i.length - 1) { return edges_i[idx_edge + 1]; }
        if (idx_edge === edges_i.length - 1 && this.wireIsClosed(wire_i)) { return edges_i[0]; }
        return null;
    }
        /**
     * Gets the prev edge in a wire.
     *
     * If the wire is open, and we are at the first edge, return null.
     *
     * If the wire is closed and we are at the first edge, return the last edge.
     */
    public wireGetPrevEdge(wire_i: number, edge_i: number): number {
        const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
        const idx_edge: number = edges_i.indexOf(edge_i);
        if (idx_edge === -1) { throw new Error('Error finding prev edge. The edge is not in the wire.'); }
        if (idx_edge > 0) { return edges_i[idx_edge - 1]; }
        if (idx_edge === 0 && this.wireIsClosed(wire_i)) { return edges_i[edges_i.length - 1]; }
        return null;
    }
    /**
     * Gets the next vert in a wire.
     *
     * If the wire is open, and we are at the last vert, return null.
     *
     * If the wire is closed and we are at the last vert, return the first vert.
     */
    public wireGetNextVert(wire_i: number, vert_i: number): number {
        const verts_i: number[] = this.wireGetVerts(wire_i);
        const idx_vert: number = verts_i.indexOf(vert_i);
        if (idx_vert === -1) { throw new Error('Error finding next vert. The vert is not in the wire.'); }
        if (idx_vert < verts_i.length - 1) { return verts_i[idx_vert + 1]; }
        if (idx_vert === verts_i.length - 1 && this.wireIsClosed(wire_i)) { return verts_i[0]; }
        return null;
    }
    /**
     * Gets the prev vert in a wire.
     *
     * If the wire is open, and we are at the first vert, return null.
     *
     * If the wire is closed and we are at the first vert, return the last vert.
     */
    public wireGetPrevVert(wire_i: number, vert_i: number): number {
        const verts_i: number[] = this.wireGetVerts(wire_i);
        const idx_vert: number = verts_i.indexOf(vert_i);
        if (idx_vert === -1) { throw new Error('Error finding prev vert. The vert is not in the wire.'); }
        if (idx_vert > 0) { return verts_i[idx_vert - 1]; }
        if (idx_vert === 0 && this.wireIsClosed(wire_i)) { return verts_i[verts_i.length - 1]; }
        return null;
    }
    /**
     * Shifts the edges of a wire.
     * ~
     * The attributes will not be affected. For example, lets say a polygon has three edges
     * e1, e2, e3, with attribute values 5, 6, 7
     * If teh edges are shifted by 1, the edges will now be
     * e2, e3, e1, withh attribute values 6, 7, 5
     */
    public wireShift(wire_i: number, offset: number): void {
        const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
        wire.unshift.apply( wire, wire.splice( offset, wire.length ) );
    }

    /**
     * Replace edges in a wire with new edges.
     *
     * If the wire is closed, then the list of edges may wrap.
     *
     * TODO This turns out to be a messm bacause the old and new edges create an inconsistent state
     */
    // public wireReplaceEdges(wire_i: number,  old_edges_i: number[], new_edges_i: number[]): void {
    //     const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
    //     // run some checks
    //     for (let i = 0; i < new_edges_i.length; i++) {
    //         if (i !== 0) {
    //             if (
    //                 this._geom_arrays.dn_edges_verts[new_edges_i[i - 1]][1] !==
    //                 this._geom_arrays.dn_edges_verts[new_edges_i[i]][0]
    //             ) { throw new Error('Error replacing edges: New edges are not in sequence.'); }
    //         }
    //         if (edges_i.indexOf(new_edges_i[i]) !== -1) { throw new Error('Error replacing edges: \
    //             The wire already contains one of the new edges.'); }
    //     }
    //     let start_idx: number = null;
    //     let end_idx: number = null;
    //     for (let i = 0; i < old_edges_i.length; i++) {
    //         if (i !== 0) {
    //             if (
    //                 this._geom_arrays.dn_edges_verts[old_edges_i[i - 1]][1] !==
    //                 this._geom_arrays.dn_edges_verts[old_edges_i[i]][0]
    //             ) { throw new Error('Error replacing edges: Old edges are not in sequence.'); }
    //         }
    //         const idx: number = edges_i.indexOf(old_edges_i[i]);
    //         if (idx === -1) { throw new Error('Error replacing edges: \
    //             The wire does not contain one of the old edges.'); }
    //         if (i = 0) { start_idx = idx; }
    //         if (i = old_edges_i.length - 1) { end_idx = idx; }
    //      }
    //     // get the start and end indexes
    //     const is_closed: boolean = this.wireIsClosed(wire_i);
    //     // check if this wraps
    //     let wrap = false;
    //     if (start_idx > end_idx) { wrap = true; }
    //     if (!is_closed && wrap) { throw new Error('Start edge comes after the end edge.'); }
    //     // wire the old edges to the new vertices
    //     const keep_edge0_i: number = this.wireGetPrevEdge(wire_i, old_edges_i[0]);
    //     const rewire_vert0_i: number = this._geom_arrays.dn_edges_verts[keep_edge0_i][1];
    //     this._insToArr(this._geom_arrays.up_verts_edges, rewire_vert0_i, new_edges_i[0], 1);
    //     const keep_edge1_i: number = this.wireGetNextEdge(wire_i, old_edges_i[old_edges_i.length - 1]);
    //     const rewire_vert1_i: number = this._geom_arrays.dn_edges_verts[keep_edge1_i][0];
    //     this._insToArr(this._geom_arrays.up_verts_edges, rewire_vert1_i, new_edges_i[new_edges_i.length - 1], 0);
    //     // make the new edges point up to this wire
    //     for (const edge_i of old_edges_i) {
    //         this._set(this._geom_arrays.up_edges_wires, edge_i, wire_i);
    //     }
    //     // splice in the new edges into the wire
    //     if (!wrap) {
    //         this._geom_arrays.dn_wires_edges[wire_i].splice(start_idx, old_edges_i.length, ...new_edges_i);
    //     } else {
    //         const updated_edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i].slice(end_idx + 1, start_idx);
    //         for (const edge_i of new_edges_i) {
    //             updated_edges_i.push(edge_i);
    //         }
    //         this._geom_arrays.dn_wires_edges[wire_i] = updated_edges_i;
    //     }
    //     // delete all the old edges and verts
    //     for (const edge_i of old_edges_i) {
    //         // edge
    //         this._clear(this._geom_arrays.up_edges_wires, edge_i, true);
    //         const verts_i: number[] = this.remEdgeEnt(edge_i);
    //         // two verts
    //         this.remVertEnt(verts_i[0]);
    //         this.remVertEnt(verts_i[1]);
    //     }
    // }
}
