import {  EEntType, IGeomArrays, TVert, TEdge, TWire, TTri, TFace, TPoint, TPline, TPgon, TColl } from '../../common';
import { GIGeom } from '../GIGeom';
import { GIGeomNav } from './GIGeomNav';

/**
 * Removing entities
 *
 */
export class GIGeomRem extends GIGeomNav {
    /**
     * Constructor
     */
    constructor(geom: GIGeom, geom_arrays: IGeomArrays) {
        super(geom, geom_arrays);
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
        this._clear(this._geom_arrays.up_posis_verts, posi_i, false);
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
        this._clear(this._geom_arrays.dn_verts_posis, vert_i, false);
        // remove up
        const posi_i: number = vert;
        this._remFromSet(this._geom_arrays.up_posis_verts, posi_i, vert_i, false);
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
        this._clear(this._geom_arrays.dn_edges_verts, edge_i, false);
        // remove up
        // const [start_vert_i, end_vert_i]: [number, number] = edge;
        // this._remFromArrIf(this._geom_arrays.up_verts_edges, start_vert_i, 1, edge_i, true);
        // this._remFromArrIf(this._geom_arrays.up_verts_edges, end_vert_i, 0, edge_i, true);
        if (this._geom_arrays.up_verts_edges[edge[0]][1][0] === edge_i) {
            this._geom_arrays.up_verts_edges[edge[0]][1] = [];
        }
        if (this._geom_arrays.up_verts_edges[edge[1]][0][0] === edge_i) {
            this._geom_arrays.up_verts_edges[edge[1]][0] = [];
        }
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
        this._clear(this._geom_arrays.dn_tris_verts, tri_i, false);
        // remove up
        const verts_i: [number, number, number] = tri;
        this._remFromSet(this._geom_arrays.up_verts_tris, verts_i, tri_i, true);
        // no attribs
        // return
        return tri;
    }
    public remWireEnt(wire_i: number): TWire {
        // down
        const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
        if (wire === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_wires_edges, wire_i, false);
        // remove up
        const edges_i: number[] = wire;
        this._clearIf(this._geom_arrays.up_edges_wires, edges_i, wire_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.WIRE, wire_i);
        // return
        return wire;
    }
    public remFaceEnt(face_i: number): TFace {
        // down
        const face: TFace = this._geom_arrays.dn_faces_wirestris[face_i];
        if (face === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_faces_wirestris, face_i, false);
        // remove up
        const wires_i: number[] = face[0];
        this._clearIf(this._geom_arrays.up_wires_faces, wires_i, face_i, true);
        const tris_i: number[] = face[1];
        this._clearIf(this._geom_arrays.up_tris_faces, tris_i, face_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.FACE, face_i);
        // return
        return face;
    }
    public remPointEnt(point_i: number): TPoint {
        // down
        const point: TPoint = this._geom_arrays.dn_points_verts[point_i];
        if (point === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_points_verts, point_i, false);
        // remove up
        const vert_i: number = point;
        this._clearIf(this._geom_arrays.up_verts_points, vert_i, point_i, true);
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
        this._clear(this._geom_arrays.dn_plines_wires, pline_i, false);
        // remove up
        const wire_i: number = pline;
        this._clearIf(this._geom_arrays.up_wires_plines, wire_i, pline_i, true);
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
        this._clear(this._geom_arrays.dn_pgons_faces, pgon_i, false);
        // remove up
        const face_i: number = pgon;
        this._clearIf(this._geom_arrays.up_faces_pgons, face_i, pgon_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.PGON, pgon_i);
        // return
        return pgon;
    }
    public remCollEnt(coll_i: number): TColl {
        // down
        const coll: TColl = this._geom_arrays.dn_colls_objs[coll_i];
        if (coll === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_colls_objs, coll_i, false);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.COLL, coll_i);
        // return
        return coll;
    }
}
