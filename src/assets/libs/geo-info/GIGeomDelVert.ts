import { EEntType, TEdge, TWire } from './common';
import { GIGeom } from './GIGeom';
/**
 * Class for deleting geometry.
 */
export class GIGeomDelVert {
    private geom: GIGeom;
    /**
     * Constructor
     */
    constructor(geom: GIGeom) {
        this.geom = geom;
    }
    /**
     * Deletes a vert.
     *
     * In the general case, the two edges adjacent to the deleted vert will be merged.
     * This means that the next edge will be deleted.
     * The end vert of the previous edge will connect to the end posi of the next edge.
     *
     * The first special case is if the vert is for a point. In that case, just delete the point.
     *
     * Then there are two special cases for which we delete the whole object
     *
     * 1) If the wire is open and has only 1 edge, then delete the wire
     * 2) if the wire is closed pgon and has only 3 edges, then:
     *    a) If the wire is the boundary of the pgon, then delete the whole pgon
     *    b) If the wire is a hole in the pgon, then delete the hole
     *
     * Assuming the special cases above do not apply,
     * then there are two more special cases for open wires
     *
     * 1) If the vert is at the start of an open wire, then delete the first edge
     * 2) If the vert is at the end of an open wire, then delete the last edge
     *
     * Finally, we come to the standard case.
     * The next edge is deleted, and the prev edge gets rewired.
     *
     */
    public delVert(vert_i: number): number[] {
        if (this.geom.data.vertIsPgon(vert_i)) {
            return this.delVertInPgon(vert_i);
        } else if (this.geom.data.vertIsPline(vert_i)) {
            return this.delVertInPline(vert_i);
        } else if (this.geom.data.vertIsPoint(vert_i)) {
            this.delVertInPoint(vert_i);
            return [];
        }
    }
    /**
     * Delete a vertex in a point
     */
    public delVertInPoint(vert_i: number): void {
        const point_i: number = this.geom.data.navVertToPoint(vert_i);
        this.geom.del.delPoints(point_i);
    }
    /**
     * Delete a vertex in a pline
     */
    public delVertInPline(vert_i: number): number[] {
        // get the posis, edges, and wires, and other info
        const edges_i: number[] = this.geom.data.navVertToEdge(vert_i);
        const wire_i: number =  this.geom.data.navEdgeToWire(edges_i[0]);
        const wire_verts_i: number[] = this.geom.data.navAnyToVert(EEntType.WIRE, wire_i);
        const wire_is_closed: boolean = this.geom.data.wireIsClosed(wire_i);
        const index_vert_i: number = wire_verts_i.indexOf(vert_i);
        const num_verts: number = wire_verts_i.length;

        // update the edges and wires
        if (num_verts < 3) {

            // pline with 2 verts
            const pline_i: number = this.geom.data.navWireToPline(wire_i);
            return this.geom.del.delPlines(pline_i);

        }  else if (!wire_is_closed && index_vert_i === 0) {

            // special case, open pline, delete start edge and vert
            this.__delVertOpenPlineStart(wire_i);

        } else if (!wire_is_closed && index_vert_i === num_verts - 1) {

            // special case, open pline, delete end edge and vert
            this.__delVertOpenPlineEnd(wire_i);

        } else {

            // standard case, delete the prev edge and reqire the next edge
            this.__delVertStandardCase(wire_i, vert_i);

        }
        return [];
    }
    /**
     * Delete a vertex in a pgon
     */
    public delVertInPgon(vert_i: number): number[] {
        // get the posis, edges, and wires, and other info
        const edges_i: number[] = this.geom.data.navVertToEdge(vert_i);
        const wire_i: number =  this.geom.data.navEdgeToWire(edges_i[0]);
        const face_i: number = this.geom.data.navWireToFace(wire_i);
        const wire_verts_i: number[] = this.geom.data.navAnyToVert(EEntType.WIRE, wire_i);
        const num_verts: number = wire_verts_i.length;
        // update the edges and wires
        if (num_verts < 4) {

            // special case, pgon with three verts
            const wires_i: number[] = this.geom.data.navFaceToWire(face_i);
            const index_face_wire: number = wires_i.indexOf(wire_i);
            if (index_face_wire === 0) {

                // special case, pgon boundary with verts, delete the pgon
                const pgon_i: number = this.geom.data.navFaceToPgon(face_i);
                return this.geom.del.delPgons(pgon_i);

            } else {

                // special case, pgon hole with verts, delete the hole
                return this.geom.del.delPgonHoles(wire_i);

            }

        } else {

            // standard case, delete the prev edge and reqire the next edge
            this.__delVertStandardCase(wire_i, vert_i);

            if (face_i !== undefined) {

                // for pgons, also update tris
                this.geom.data.faceTri(face_i);

            }
        }
        return [];
    }
    /**
     * Special case, delete the first edge
     */
    private __delVertOpenPlineStart(wire_i: number): void {
        const wire_edges_i: number[] = this.geom.data.navWireToEdge(wire_i);
        // vert_i is at the star of an open wire, we have one edge
        const start_edge_i: number = wire_edges_i[0];
        // delete the first edge
        const verts_i: [number, number] = this.geom.data.remEdgeEnt(start_edge_i);
        // delete the first vertex
        this.geom.data.remVertEnt(verts_i[0]);
        // unlink the second vertex
        this.geom.data.unlinkEdgeEndVert(wire_i, verts_i[1]);
    }
    /**
     * Special case, delete the last edge
     * @param vert_i
     */
    private __delVertOpenPlineEnd(wire_i: number): void {
        const wire_edges_i: number[] = this.geom.data.navWireToEdge(wire_i);
        // vert_i is at the star of an open wire, we have one edge
        const end_edge_i: number = wire_edges_i[0];
        // delete the first edge
        const verts_i: [number, number] = this.geom.data.remEdgeEnt(end_edge_i);
        // delete the first vertex
        this.geom.data.remVertEnt(verts_i[1]);
        // unlink the second vertex
        this.geom.data.unlinkEdgeStartVert(wire_i, verts_i[0]);
    }
    /**
     * Final case, delete the next edge, reqire the previous edge
     * For pgons, this does not update the tris
     * @param vert_i
     */
    private __delVertStandardCase(wire_i: number, vert_i: number): void {
        const wire_edges_i: number[] = this.geom.data.navWireToEdge(wire_i);
        // vert_i is in the middle of a wire, we must have two edges
        const old_edges_i: number[] = this.geom.data.navVertToEdge(vert_i);
        // get the old edge data
        const idx_a: number = wire_edges_i.indexOf(old_edges_i[0]);
        const idx_b: number = wire_edges_i.indexOf(old_edges_i[1]);
        const edge_a_verts_i: [number, number] = this.geom.data.navEdgeToVert(old_edges_i[0]);
        const edge_b_verts_i: [number, number] = this.geom.data.navEdgeToVert(old_edges_i[1]);
        // create new edge
        const new_edge: TEdge = [edge_a_verts_i[0], edge_b_verts_i[1]];
        const new_edge_i: number = this.geom.data.addEdgeEnt(new_edge);
        // create new wire
        const new_edges_i: TWire = wire_edges_i.slice();
        new_edges_i.splice(idx_a, 1, new_edge_i);
        new_edges_i.splice(idx_b, 1);
        this.geom.data.insWireEnt(new_edges_i, wire_i);
        // delete the two old edges
        this.geom.data.remEdgeEnt(old_edges_i[0]);
        this.geom.data.remEdgeEnt(old_edges_i[1]);
        // delete the old vert
        this.geom.data.remVertEnt(vert_i);
    }
}
