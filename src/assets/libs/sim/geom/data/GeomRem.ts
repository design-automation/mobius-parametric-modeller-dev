import {  EEntType, IGeomArrays, TVert, TEdge, TWire, TTri, TFace, TPoint, TPline, TPgon, TColl, TFaceWire, TFaceTri, TCollParent, TCollPoints, TCollPlines, TCollPgons } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Removing entities
 *
 */
export class GeomRem extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    // ============================================================================
    // Remove entities from the datastructure
    // Updates the links to the ents immediatley below the ent being removed
    //   down - a link from this ent down to the ent below it
    //   up - a link from the ent below this ent up to this ent
    // Does not update any links to the ents above, but instead returns the ent_i
    // Returns teh entity that was removed
    // ============================================================================
    public remPosiEnt(posi_i: number): number[] { // return array of vert_i
        // up
        const verts_i: number[] = this._geom_arrays.up_posis_verts[posi_i];
        if (verts_i === null) { return null; }
        // remove up
        this._clearValsInArr(this._geom_arrays.up_posis_verts, posi_i, false);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.POSI, posi_i);
        // return
        return verts_i;
    }
    public remVertEnt(vert_i: number): TVert {
        // down
        const vert: TVert = this._geom_arrays.dn_verts_posis[vert_i];
        if (vert === null) { return null; }
        // remove down
        this._clearValsInArr(this._geom_arrays.dn_verts_posis, vert_i, false);
        // remove up
        const posi_i: number = vert;
        this._remValFromSetInArr(this._geom_arrays.up_posis_verts, posi_i, vert_i, false);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.VERT, vert_i);
        // return
        return vert;
    }
    public remEdgeEnt(edge_i: number): TEdge {
        // down
        const edge: TEdge = this._geom_arrays.dn_edges_verts[edge_i];
        if (edge === null) { return null; }
        // remove down
        this._clearValsInArr(this._geom_arrays.dn_edges_verts, edge_i, false);
        // remove up
        const [start_vert_i, end_vert_i]: [number, number] = edge;
        this._remValFromArrInArrIf(this._geom_arrays.up_verts_edges, start_vert_i, 1, edge_i, true);
        this._remValFromArrInArrIf(this._geom_arrays.up_verts_edges, end_vert_i, 0, edge_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.EDGE, edge_i);
        // return
        return edge;
    }
    public remTriEnt(tri_i: number): TTri {
        // down
        const tri: TTri = this._geom_arrays.dn_tris_verts[tri_i];
        if (tri === null) { return null; }
        // remove down
        this._clearValsInArr(this._geom_arrays.dn_tris_verts, tri_i, false);
        // remove up
        const verts_i: [number, number, number] = tri;
        this._remValFromSetInArr(this._geom_arrays.up_verts_tris, verts_i, tri_i, true);
        // no attribs
        // return
        return tri;
    }
    public remWireEnt(wire_i: number): TWire {
        // down
        const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
        if (wire === null) { return null; }
        // remove down
        this._clearValsInArr(this._geom_arrays.dn_wires_edges, wire_i, false);
        // remove up
        const edges_i: number[] = wire;
        this._clearValsInArrIf(this._geom_arrays.up_edges_wires, edges_i, wire_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.WIRE, wire_i);
        // return
        return wire;
    }
    public remFaceEnt(face_i: number): TFace {
        // down
        const face_wires: TFaceWire = this._geom_arrays.dn_faces_wires[face_i];
        const face_tris: TFaceTri = this._geom_arrays.dn_faces_tris[face_i];
        if (face_wires === null) { return null; }
        // remove down
        this._clearValsInArr(this._geom_arrays.dn_faces_wires, face_i, false);
        this._clearValsInArr(this._geom_arrays.dn_faces_tris, face_i, false);
        // remove up
        this._clearValsInArrIf(this._geom_arrays.up_wires_faces, face_wires, face_i, true);
        this._clearValsInArrIf(this._geom_arrays.up_tris_faces, face_tris, face_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.FACE, face_i);
        // return
        return [face_wires, face_tris];
    }
    public remPointEnt(point_i: number): TPoint {
        // down
        const point: TPoint = this._geom_arrays.dn_points_verts[point_i];
        if (point === null) { return null; }
        // remove down
        this._clearValsInArr(this._geom_arrays.dn_points_verts, point_i, false);
        // remove up
        const vert_i: number = point;
        this._clearValsInArrIf(this._geom_arrays.up_verts_points, vert_i, point_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.POINT, point_i);
        // return
        return point;
    }
    public remPlineEnt(pline_i: number): TPline  {
        // down
        const pline: TPline = this._geom_arrays.dn_plines_wires[pline_i];
        if (pline === null) { return null; }
        // remove down
        this._clearValsInArr(this._geom_arrays.dn_plines_wires, pline_i, false);
        // remove up
        const wire_i: number = pline;
        this._clearValsInArrIf(this._geom_arrays.up_wires_plines, wire_i, pline_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.PLINE, pline_i);
        // return
        return pline;
    }
    public remPgonEnt(pgon_i: number): TPgon {
        // down
        const pgon: TPgon = this._geom_arrays.dn_pgons_faces[pgon_i];
        if (pgon === null) { return null; }
        // remove down
        this._clearValsInArr(this._geom_arrays.dn_pgons_faces, pgon_i, false);
        // remove up
        const face_i: number = pgon;
        this._clearValsInArrIf(this._geom_arrays.up_faces_pgons, face_i, pgon_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.PGON, pgon_i);
        // return
        return pgon;
    }
    public remCollEnt(coll_i: number): TColl {
        // down
        const coll_parent: TCollParent = this._geom_arrays.dn_colls_parents[coll_i];
        const coll_points: TCollPoints = this._geom_arrays.dn_colls_points[coll_i];
        const coll_plines: TCollPlines = this._geom_arrays.dn_colls_plines[coll_i];
        const coll_pgons: TCollPgons = this._geom_arrays.dn_colls_pgons[coll_i];
        if (coll_parent === null) { return null; }
        // remove down
        this._clearValsInArr(this._geom_arrays.dn_colls_parents, coll_i, false);
        this._clearValsInArr(this._geom_arrays.dn_colls_points, coll_i, false);
        this._clearValsInArr(this._geom_arrays.dn_colls_plines, coll_i, false);
        this._clearValsInArr(this._geom_arrays.dn_colls_pgons, coll_i, false);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.COLL, coll_i);
        // return
        return [coll_parent, coll_points, coll_plines, coll_pgons];
    }
}
