import { IGeomArrays, TVert, TEdge, TWire, TFace, TPoint, TPline, TPgon, TColl, } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Inserting entities, thereby replacing existing entities.
 *
 */
export class GeomIns extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom, geom_arrays: IGeomArrays) {
        super(geom, geom_arrays);
    }
    // ============================================================================
    // Insert an entity, replacing an existing entity in the process
    // These methods do not remove anything
    // Bidirectional
    // Data is copied
    // ============================================================================
    public insVertEnt(vert: TVert, vert_i: number): void {
        // down
        this._geom_arrays.dn_verts_posis[vert_i] = vert;
        // up
        this._addToSet(this._geom_arrays.up_posis_verts, vert, vert_i);
    }
    public insEdgeEnt(edge: TEdge, edge_i: number): void {
        edge = edge.slice() as TEdge;
        // down
        this._geom_arrays.dn_edges_verts[edge_i] = edge;
        // up
        // this._insToArr(this._geom_arrays.up_verts_edges, edge[0], edge_i, 1);
        // this._insToArr(this._geom_arrays.up_verts_edges, edge[1], edge_i, 0);
        this._geom_arrays.up_verts_edges[edge[0]][1][0] = edge_i;
        this._geom_arrays.up_verts_edges[edge[1]][0][0] = edge_i;
    }
    public insWireEnt(wire: TWire, wire_i: number): void {
        wire = wire.slice() as TWire;
        // down
        this._geom_arrays.dn_wires_edges[wire_i] = wire;
        // up
        this._set(this._geom_arrays.up_edges_wires, wire, wire_i);
    }
    public insFaceEnt(face: TFace, face_i: number): void {
        face = [face[0].slice(), face[1].slice()] as TFace;
        // down
        this._geom_arrays.dn_faces_wirestris[face_i] = face;
        // up
        this._set(this._geom_arrays.up_wires_faces, face[0], face_i);
        this._set(this._geom_arrays.up_tris_faces, face[1], face_i);
    }
    public insPointEnt(point: TPoint, point_i: number): void {
        // down
        this._geom_arrays.dn_points_verts[point_i] = point;
        // up
        this._set(this._geom_arrays.up_verts_points, point, point_i);
    }
    public insPlineEnt(pline: TPline, pline_i: number): void {
        // down
        this._geom_arrays.dn_plines_wires[pline_i] = pline;
        // up
        this._set(this._geom_arrays.up_wires_plines, pline, pline_i);
    }
    public insPgonEnt(pgon: TPgon, pgon_i: number): void {
        // down
        this._geom_arrays.dn_pgons_faces[pgon_i] = pgon;
        // up
        this._set(this._geom_arrays.up_faces_pgons, pgon, pgon_i);
    }
    public insCollEnt(coll: TColl, coll_i: number): void {
        coll = [coll[0], coll[1].slice(), coll[2].slice(), coll[3].slice()] as TColl;
        // down
        this._geom_arrays.dn_colls_objs[coll_i] = coll;
        // up
        this._addToSet(this._geom_arrays.up_points_colls, coll[1], coll_i); // points
        this._addToSet(this._geom_arrays.up_plines_colls, coll[2], coll_i); // plines
        this._addToSet(this._geom_arrays.up_pgons_colls,  coll[3], coll_i); // pgons
    }
}
