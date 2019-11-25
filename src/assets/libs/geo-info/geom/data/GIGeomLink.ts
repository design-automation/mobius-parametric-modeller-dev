import { IGeomArrays } from '../../common';
import { GIGeom } from '../GIGeom';
import { GIGeomNav } from './GIGeomNav';

/**
 * Linking and unlinking entities.
 *
 */
export class GIGeomLink extends GIGeomNav {
    /**
     * Constructor
     */
    constructor(geom: GIGeom, geom_arrays: IGeomArrays) {
        super(geom, geom_arrays);
    }
    // ============================================================================
    // Link entities
    // Bidirectional
    // ============================================================================
    public linkVertPosi(vert_i: number, posi_i: number): void {
        // down
        this._geom_arrays.dn_verts_posis[vert_i] = posi_i;
        // up
        this._addToSet(this._geom_arrays.up_posis_verts, posi_i, vert_i);
    }
    public linkEdgeStartVert(edge_i: number, vert_i: number): void {
        // down
        this._geom_arrays.dn_edges_verts[edge_i][0] = vert_i;
        // up
        const edges_i: [number[], number[]] = this._geom_arrays.up_verts_edges[vert_i];
        if (edges_i === undefined) {
            this._geom_arrays.up_verts_edges[vert_i] = [[], [edge_i]]; // Empty array
        } else {
            this._geom_arrays.up_verts_edges[vert_i][1] = [edge_i];
        }
    }
    public linkEdgeEndVert(edge_i: number, vert_i: number): void {
        // down
        this._geom_arrays.dn_edges_verts[edge_i][1] = vert_i;
        // up
        const edges_i:  [number[], number[]] = this._geom_arrays.up_verts_edges[vert_i];
        if (edges_i === undefined) {
            this._geom_arrays.up_verts_edges[vert_i] = [[edge_i], []]; // Empty array
        } else {
            this._geom_arrays.up_verts_edges[vert_i][0] = [edge_i];
        }
    }
    public linkWireEdge(wire_i: number, idx: number,  edge_i: number): void {
        // down
        this._geom_arrays.dn_wires_edges[wire_i][idx] = edge_i;
        // up
        this._geom_arrays.up_edges_wires[edge_i] = wire_i;
    }
    public linkFaceTri(face_i: number, tri_i: number): void {
        // down
        this._geom_arrays.dn_faces_wirestris[face_i][1].push(tri_i);
        // up
        this._geom_arrays.up_tris_faces[tri_i] = face_i;
    }
    public linkFaceWire(face_i: number, idx: number, wire_i: number): void {
        // down
        this._geom_arrays.dn_faces_wirestris[face_i][0][idx] = wire_i;
        // up
        this._geom_arrays.up_wires_faces[wire_i] = face_i;
    }
    public linkPointVert(point_i: number, vert_i: number): void {
        // down
        this._geom_arrays.dn_points_verts[point_i] = vert_i;
        // up
        this._geom_arrays.up_verts_points[vert_i] = point_i;
    }
    public linkPlineWire(pline_i: number, wire_i: number): void {
        // down
        this._geom_arrays.dn_plines_wires[pline_i] = wire_i;
        // up
        this._geom_arrays.up_wires_plines[wire_i] = pline_i;
    }
    public linkPgonFace(pgon_i: number, face_i: number): void {
        // down
        this._geom_arrays.dn_pgons_faces[pgon_i] = face_i;
        // up
        this._geom_arrays.up_faces_pgons[face_i] = pgon_i;
    }
    public linkCollPoint(coll_i: number, point_i: number): void {
        // down
        this._addToSet(this._geom_arrays.dn_colls_objs, 1, point_i);
        // up
        this._addToSet(this._geom_arrays.up_points_colls, point_i, coll_i);
    }
    public linkCollPline(coll_i: number, pline_i: number): void {
        // down
        this._addToSet(this._geom_arrays.dn_colls_objs, 2, pline_i);
        // up
        this._addToSet(this._geom_arrays.up_plines_colls, pline_i, coll_i);
    }
    public linkCollPgon(coll_i: number, pgon_i: number): void {
        // down
        this._addToSet(this._geom_arrays.dn_colls_objs, 3, pgon_i);
        // up
        this._addToSet(this._geom_arrays.up_pgons_colls, pgon_i, coll_i);
    }
    // ============================================================================
    // Unlink entities
    // Bidirectional unlinkAB A <-> B
    // Non-didirectional unlinkAToB A -> B
    // ============================================================================
    public unlinkVertPosi(vert_i: number, posi_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_verts_posis, vert_i, false);
        // up
        this._remFromSet(this._geom_arrays.up_posis_verts, posi_i, vert_i, true);
    }
    public unlinkPosiToVert(posi_i: number, vert_i: number): void {
        // up
        this._remFromSet(this._geom_arrays.up_posis_verts, posi_i, vert_i, true);
    }
    public unlinkEdgeStartVert(edge_i: number, vert_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_edges_verts[edge_i], 0, false);
        // up
        if (this._geom_arrays.up_verts_edges[vert_i][0].length === 0) { return; } // TODO is this needed
        this._clearIf(this._geom_arrays.up_verts_edges[vert_i][1], 0, edge_i, false);
    }
    public unlinkEdgeEndVert(edge_i: number, vert_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_edges_verts[edge_i], 1, false);
        // up
        if (this._geom_arrays.up_verts_edges[vert_i][0].length === 0) { return; } // TODO is this needed
        this._clearIf( this._geom_arrays.up_verts_edges[vert_i][0], 0, edge_i, false);
    }
    public unlinkVertToEdge(vert_i: number, edge_i: number): void {
        // up
        if (this._geom_arrays.up_verts_edges[vert_i][0].length === 0) { return; } // TODO is this needed
        this._clearIf(this._geom_arrays.up_verts_edges[vert_i][0], 0, edge_i, false);
        this._clearIf(this._geom_arrays.up_verts_edges[vert_i][1], 0, edge_i, false);
    }
    public unlinkWireEdge(wire_i: number, edge_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_wires_edges, wire_i, edge_i, false);
        // up
        this._clearIf( this._geom_arrays.up_edges_wires, edge_i, wire_i, true);
    }
    public unlinkEdgeToWire(edge_i: number, wire_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_edges_wires, edge_i, wire_i, true);
    }
    public unlinkFaceTri(face_i: number, tri_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_faces_wirestris[face_i], 1, tri_i, false);
        // up
        this._clearIf( this._geom_arrays.up_tris_faces, tri_i, face_i, true);
    }
    public unlinkTriToFace(tri_i: number, face_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_tris_faces, tri_i, face_i, true);
    }
    public unlinkFaceWire(face_i: number, wire_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_faces_wirestris[face_i], 0, wire_i, false);
        // up
        this._clearIf( this._geom_arrays.up_wires_faces, wire_i, face_i, true);
    }
    public unlinkWireToFace(wire_i: number, face_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_wires_faces, wire_i, face_i, true);
    }
    public unlinkPointVert(point_i: number, vert_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_points_verts, point_i, false);
        // up
        this._clearIf( this._geom_arrays.up_verts_points, vert_i, point_i, true);
    }
    public unlinkVertToPoint(vert_i: number, point_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_verts_points, vert_i, point_i, true);
    }
    public unlinkPlineWire(pline_i: number, wire_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_plines_wires, pline_i, false);
        // up
        this._clearIf( this._geom_arrays.up_wires_plines, wire_i, pline_i, true);
    }
    public unlinkWireToPline(wire_i: number, pline_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_wires_plines, wire_i, pline_i, true);
    }
    public unlinkPgonFace(pgon_i: number, face_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_pgons_faces, pgon_i, false);
        // up
        this._clearIf( this._geom_arrays.up_faces_pgons, face_i, pgon_i, true);
    }
    public unlinkFaceToPgon(face_i: number, pgon_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_faces_pgons, face_i, pgon_i, true);
    }
    public unlinkCollPoint(coll_i: number, point_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_colls_objs, 1, point_i, false);
        // up
        this._remFromSet(this._geom_arrays.up_points_colls, point_i, coll_i, true);
    }
    public unlinkPointToColl(point_i: number, coll_i: number): void {
        // up
        this._remFromSet(this._geom_arrays.up_points_colls, point_i, coll_i, true);
    }
    public unlinkCollPline(coll_i: number, pline_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_colls_objs, 2, pline_i, false);
        // up
        this._remFromSet(this._geom_arrays.up_plines_colls, pline_i, coll_i, true);
    }
    public unlinkPlineToColl(pline_i: number, coll_i: number): void {
        // up
        this._remFromSet(this._geom_arrays.up_plines_colls, pline_i, coll_i, true);
    }
    public unlinkCollPgon(coll_i: number, pgon_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_colls_objs, 3, pgon_i, false);
        // up
        this._remFromSet(this._geom_arrays.up_pgons_colls, pgon_i, coll_i, true);
    }
    public unlinkPgonToColl(pgon_i: number, coll_i: number): void {
        // up
        this._remFromSet(this._geom_arrays.up_pgons_colls, pgon_i, coll_i, true);
    }
}
