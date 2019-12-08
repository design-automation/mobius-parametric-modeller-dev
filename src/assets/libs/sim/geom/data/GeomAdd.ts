import { IGeomArrays, TVert, TEdge, TWire, TTri, TFace, TPoint, TPline, TPgon, TColl } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Adding entities, thereby creating a ew ID
 *
 */
export class GeomAdd extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom, geom_arrays: IGeomArrays) {
        super(geom, geom_arrays);
    }
    // ============================================================================
    // Add entities into the data structure
    // Updates the links to the ents immediatley below the ent being inserted
    //   down - a link from this ent down to the ent below it
    //   up - a link from the ent below this ent up to this ent
    // Does not update any links to the ents above, but instead returns the ent_i
    // ============================================================================
    public addPosiEnt(): number {
        return this._geom_arrays.up_posis_verts.push([]) - 1;
    }
    public addVertEnt(vert: TVert): number {
        // down
        const vert_i: number = this._geom_arrays.dn_verts_posis.push(vert) - 1;
        // up
        this._addToSet(this._geom_arrays.up_posis_verts, vert, vert_i);
        // return
        return vert_i;
    }
    public addEdgeEnt(edge: TEdge): number {
        // down
        const edge_i: number =  this._geom_arrays.dn_edges_verts.push(edge) - 1;
        // up
        // this._insToArr(this._geom_arrays.up_verts_edges, edge[0], edge_i, 1);
        // this._insToArr(this._geom_arrays.up_verts_edges, edge[1], edge_i, 0);
        if (this._geom_arrays.up_verts_edges[edge[0]] === undefined) {
            this._geom_arrays.up_verts_edges[edge[0]] = [[], [edge_i]];
        } else {
            this._geom_arrays.up_verts_edges[edge[0]][1][0] = edge_i;
        }
        if (this._geom_arrays.up_verts_edges[edge[1]] === undefined) {
            this._geom_arrays.up_verts_edges[edge[1]] = [[edge_i], []];
        } else {
            this._geom_arrays.up_verts_edges[edge[1]][0][0] = edge_i;
        }
        // return
        return edge_i;
    }
    public addEdgeEnts(verts_i: number[], is_closed: boolean): number[] {
        const edges_i: number[] = [];
        for (let i = 0; i < verts_i.length - 1; i++) {
            const edge: TEdge = [verts_i[i], verts_i[i + 1]];
            edges_i.push( this.addEdgeEnt(edge) );
        }
        if (is_closed) {
            const last_edge: TEdge = [verts_i[verts_i.length - 1], verts_i[0]];
            edges_i.push( this.addEdgeEnt(last_edge));
        }
        return edges_i;
    }
    public addTriEnt(tri: TTri): number {
        // down
        const tri_i: number =  this._geom_arrays.dn_tris_verts.push(tri) - 1;
        // up
        this._addToSet(this._geom_arrays.up_verts_tris, tri, tri_i);
        // return
        return tri_i;
    }
    public addWireEnt(wire: TWire): number {
        // down
        const wire_i: number =  this._geom_arrays.dn_wires_edges.push(wire) - 1;
        // up
        this._set(this._geom_arrays.up_edges_wires, wire, wire_i);
        // return
        return wire_i;
    }
    public addFaceEnt(face: TFace): number {
        // down
        const face_i: number =  this._geom_arrays.dn_faces_wirestris.push(face) - 1;
        // up
        this._set(this._geom_arrays.up_wires_faces, face[0], face_i);
        this._set(this._geom_arrays.up_tris_faces, face[1], face_i);
        // return
        return face_i;
    }
    public addPointEnt(point: TPoint): number {
        // down
        const point_i: number =  this._geom_arrays.dn_points_verts.push(point) - 1;
        // up
        this._set(this._geom_arrays.up_verts_points, point, point_i);
        // return
        return point_i;
    }
    public addPlineEnt(pline: TPline): number {
        // down
        const pline_i: number =  this._geom_arrays.dn_plines_wires.push(pline) - 1;
        // up
        this._set(this._geom_arrays.up_wires_plines, pline, pline_i);
        // return
        return pline_i;
    }
    public addPgonEnt(pgon: TPgon): number {
        // down
        const pgon_i: number =  this._geom_arrays.dn_pgons_faces.push(pgon) - 1;
        // up
        this._set(this._geom_arrays.up_faces_pgons, pgon, pgon_i);
        // return
        return pgon_i;
    }
    public addCollEnt(coll: TColl): number {
        // down
        const coll_i: number = this._geom_arrays.dn_colls_objs.push(coll) - 1;
        // up
        this._addToSet(this._geom_arrays.up_points_colls, coll[1], coll_i); // points
        this._addToSet(this._geom_arrays.up_plines_colls, coll[2], coll_i); // plines
        this._addToSet(this._geom_arrays.up_pgons_colls,  coll[3], coll_i); // pgons
        // return
        return coll_i;
    }

}
