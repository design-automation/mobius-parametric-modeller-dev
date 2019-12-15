import { TTri, TVert, TEdge, TWire,
    TColl, TPoint, TPline, TPgon, IGeomArrays, TFaceWires, TFaceTris } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Class for geometry.
 */
export class GeomMerge extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    /**
     * Adds data to this model from another model.
     * The existing data in the model is not deleted.
     * Both models may have deleted items, resulting in null values.
     * @param geom_arrays The geom_arrays of the other model.
     */
    public merge(geom: Geom): void {
        const ga: IGeomArrays = geom.data._geom_arrays;
        // get lengths of existing entities before we start adding stuff
        const num_posis: number = this._geom_arrays.up_posis_verts.length;
        const num_verts: number = this._geom_arrays.dn_verts_posis.length;
        const num_tris: number = this._geom_arrays.dn_tris_verts.length;
        const num_edges: number = this._geom_arrays.dn_edges_verts.length;
        const num_wires: number = this._geom_arrays.dn_wires_edges.length;
        const num_faces: number = this._geom_arrays.dn_faces_wires.length;
        const num_points: number = this._geom_arrays.dn_points_verts.length;
        const num_plines: number = this._geom_arrays.dn_plines_wires.length;
        const num_pgons: number = this._geom_arrays.dn_pgons_faces.length;
        const num_colls: number = this._geom_arrays.up_colls_parents.length;
        // ----------------------------------------------------------------------------------------
        // Update the down arrays
        // deleted entities will be undefined
        // ----------------------------------------------------------------------------------------
        // verts to posis
        for (let i = 0; i < ga.dn_verts_posis.length; i++) {
            const posi_i: number = ga.dn_verts_posis[i];
            if (posi_i !== undefined) {
                const new_vert: TVert = posi_i + num_posis as TVert;
                this._geom_arrays.dn_verts_posis.push( new_vert );
            }
        }
        // tris to verts
        for (let i = 0; i < ga.dn_tris_verts.length; i++) {
            const verts_i: number[] = ga.dn_tris_verts[i];
            if (verts_i !== undefined) {
                const new_triangle: TTri = verts_i.map(v => v + num_verts) as TTri;
                this._geom_arrays.dn_tris_verts.push( new_triangle );
            }
        }
        // edges to verts
        for (let i = 0; i < ga.dn_edges_verts.length; i++) {
            const verts_i: number[] = ga.dn_edges_verts[i];
            if (verts_i !== undefined) {
                const new_edge: TEdge = verts_i.map(v => v + num_verts) as TEdge;
                this._geom_arrays.dn_edges_verts.push( new_edge );
            }
        }
        // wires to edges
        for (let i = 0; i < ga.dn_wires_edges.length; i++) {
            const edges_i: number[] = ga.dn_wires_edges[i];
            if (edges_i !== undefined) {
                const new_wire: TWire = edges_i.map(e => e + num_edges) as TWire;
                this._geom_arrays.dn_wires_edges.push( new_wire );
            }
        }
        // faces to wires
        for (let i = 0; i < ga.dn_faces_wires.length; i++) {
            const wires_i: number[]  = ga.dn_faces_wires[i];
            if (wires_i !== undefined) {
                const new_face_wires: TFaceWires = wires_i.map( w => w + num_wires );
                this._geom_arrays.dn_faces_wires.push( new_face_wires );
            }
        }
        // faces to tris
        for (let i = 0; i < ga.dn_faces_tris.length; i++) {
            const tris_i: number[] = ga.dn_faces_tris[i];
            if (tris_i !== undefined) {
                const new_face_tris: TFaceTris = tris_i.map( t => t + num_tris );
                this._geom_arrays.dn_faces_tris.push( new_face_tris );
            }
        }
        // points to verts
        for (let i = 0; i < ga.dn_points_verts.length; i++) {
            const vert_i: number = ga.dn_points_verts[i];
            if (vert_i !== undefined) {
                const new_point: TPoint = vert_i + num_verts as TPoint;
                this._geom_arrays.dn_points_verts.push( new_point );
            }
        }
        // plines to wires
        for (let i = 0; i < ga.dn_plines_wires.length; i++) {
            const wire_i: number = ga.dn_plines_wires[i];
            if (wire_i !== undefined) {
                const new_pline: TPline = wire_i + num_wires as TPline;
                this._geom_arrays.dn_plines_wires.push( new_pline );
            }
        }
        // pgons to faces
        for (let i = 0; i < ga.dn_pgons_faces.length; i++) {
            const face_i: number = ga.dn_pgons_faces[i];
            if (face_i !== undefined) {
                const new_pgon: TPgon = face_i + num_faces as TPgon;
                this._geom_arrays.dn_pgons_faces.push( new_pgon );
            }
        }
        // colls to points
        for (let i = 0; i < ga.dn_colls_points.length; i++) {
            const coll_points_i: number[] = ga.dn_colls_points[i];
            if (coll_points_i !== undefined) {
                const new_coll_points_i: number[] = coll_points_i.map( point => point + num_points);
                this._geom_arrays.dn_colls_points.push( new_coll_points_i );
            }
        }
        // colls to plines
        for (let i = 0; i < ga.dn_colls_plines.length; i++) {
            const coll_plines_i: number[] = ga.dn_colls_plines[i];
            if (coll_plines_i !== undefined) {
                const new_coll_points_i: number[] = coll_plines_i.map( pline => pline + num_plines);
                this._geom_arrays.dn_colls_plines.push( new_coll_points_i );
            }
        }
        // colls to pgons
        for (let i = 0; i <  ga.dn_colls_pgons.length; i++) {
            const coll_pgons_i: number[] = ga.dn_colls_pgons[i];
            if (coll_pgons_i !== undefined) {
                const new_coll_pgons_i: number[] = coll_pgons_i.map( pgon => pgon + num_pgons);
                this._geom_arrays.dn_colls_pgons.push( new_coll_pgons_i );
            }
        }
        // ----------------------------------------------------------------------------------------
        // update up arrays
        // ----------------------------------------------------------------------------------------
        // posis to verts (they can be undefined or [])
        // undefine = deleted
        // [] = a posi with no verts
        const pv_i_max = ga.up_posis_verts.length;
        for (let pv_i = 0;  pv_i < pv_i_max; pv_i++) {
            const verts_i: number[] = ga.up_posis_verts[pv_i];
            if (verts_i !== undefined) {
                const new_verts_i: number[] = verts_i.map( vert_i => vert_i + num_verts);
                this._geom_arrays.up_posis_verts[pv_i + num_posis] = new_verts_i;
            }
        }
        // verts to tris
        const vt_i_max = ga.up_verts_tris.length;
        for (let vt_i = 0;  vt_i < vt_i_max; vt_i++) {
            const tris_i: number[] = ga.up_verts_tris[vt_i];
            if (tris_i !== undefined) {
                const new_tris_i: number[] = tris_i.map( tri_i => tri_i + num_tris);
                this._geom_arrays.up_verts_tris[vt_i + num_verts] = new_tris_i;
            }
        }
        // tris to faces
        const tf_i_max = ga.up_tris_faces.length;
        for (let tf_i = 0;  tf_i < tf_i_max; tf_i++) {
            const face_i: number = ga.up_tris_faces[tf_i];
            if (face_i !== undefined) {
                const new_face_i: number = face_i + num_faces;
                this._geom_arrays.up_tris_faces[tf_i + num_tris] = new_face_i;
            }
        }
        // verts to edges
        const ve_i_max = ga.up_verts_edges.length;
        for (let ve_i = 0;  ve_i < ve_i_max; ve_i++) {
            const edges_i: [number, number] = ga.up_verts_edges[ve_i];
            if (edges_i !== undefined) {
                let edge0_i: number = edges_i[0];
                if (edge0_i !== null) { edge0_i = edge0_i + num_edges; } // TODO check if this is right
                let edge1_i: number = edges_i[1];
                if (edge1_i !== null) { edge1_i = edge1_i + num_edges; }
                this._geom_arrays.up_verts_edges[ve_i + num_verts] = [edge0_i, edge1_i];
            }
        }
        // edges to wires
        const ew_i_max = ga.up_edges_wires.length;
        for (let ew_i = 0; ew_i < ew_i_max; ew_i++) {
            const wire_i: number = ga.up_edges_wires[ew_i];
            if (wire_i !== undefined) {
                const new_wire_i: number = wire_i + num_wires;
                this._geom_arrays.up_edges_wires[ew_i + num_edges] = new_wire_i;
            }
        }
        // wires to faces
        const wf_i_max = ga.up_wires_faces.length;
        for (let wf_i = 0;  wf_i < wf_i_max; wf_i++) {
            const face_i: number = ga.up_wires_faces[wf_i];
            if (face_i !== undefined) {
                const new_face_i: number = face_i + num_faces;
                this._geom_arrays.up_wires_faces[wf_i + num_wires] = new_face_i;
            }
        }
        // verts to points
        const vp_i_max = ga.up_verts_points.length;
        for (let vp_i = 0;  vp_i < vp_i_max; vp_i++) {
            const point_i: number = ga.up_verts_points[vp_i];
            if (point_i !== undefined) {
                const new_point_i: number = point_i + num_points;
                this._geom_arrays.up_verts_points[vp_i + num_points] = new_point_i;
            }
        }
        // wires to plines
        const wp_i_max = ga.up_wires_plines.length;
        for (let wp_i = 0;  wp_i < wp_i_max; wp_i++) {
            const pline_i: number = ga.up_wires_plines[wp_i];
            if (pline_i !== undefined) {
                const new_pline_i: number = pline_i + num_plines;
                this._geom_arrays.up_wires_plines[wp_i + num_wires] = new_pline_i;
            }
        }
        // faces to pgons
        const fp_i_max = ga.up_faces_pgons.length;
        for (let fp_i = 0;  fp_i < fp_i_max; fp_i++) {
            const pgon_i: number = ga.up_faces_pgons[fp_i];
            if (pgon_i !== undefined) {
                const new_pgon_i: number = pgon_i + num_pgons;
                this._geom_arrays.up_faces_pgons[fp_i + num_faces] = new_pgon_i;
            }
        }
        // points to colls
        const poc_i_max = ga.up_points_colls.length;
        for (let poc_i = 0; poc_i < poc_i_max; poc_i++) {
            const colls_i: number[] = ga.up_points_colls[poc_i];
            if (colls_i !== undefined) {
                const new_colls_i: number[] = colls_i.map(coll_i => coll_i + num_colls);
                this._geom_arrays.up_points_colls[poc_i + num_points] = new_colls_i;
            }
        }
        // plines to colls
        const plc_i_max = ga.up_plines_colls.length;
        for (let plc_i = 0; plc_i < plc_i_max; plc_i++) {
            const colls_i: number[] = ga.up_plines_colls[plc_i];
            if (colls_i !== undefined) {
                const new_colls_i: number[] = colls_i.map(coll_i => coll_i + num_colls);
                this._geom_arrays.up_plines_colls[plc_i + num_plines] = new_colls_i;
            }
        }
        // pgons to colls
        const pgc_i_max = ga.up_pgons_colls.length;
        for (let pgc_i = 0; pgc_i < pgc_i_max; pgc_i++) {
            const colls_i: number[] = ga.up_pgons_colls[pgc_i];
            if (colls_i !== undefined) {
                const new_colls_i: number[] = colls_i.map(coll_i => coll_i + num_colls);
                this._geom_arrays.up_pgons_colls[pgc_i + num_pgons] = new_colls_i;
            }
        }
        // colls up to coll parents
        for (let i = 0; i < ga.up_colls_parents.length; i++) {
            const coll_parent_i: number = ga.up_colls_parents[i];
            if (coll_parent_i !== undefined) { // null means no parent, undefined means deleted
                const new_coll_parent_i: number = (coll_parent_i === null) ? null : coll_parent_i + num_colls;
                this._geom_arrays.up_colls_parents.push( new_coll_parent_i );
            }
        }
    }

    // /**
    //  * Returns the JSON data for this model.
    //  * Experimetal/// TODO
    //  */
    // public merge2(geom_arrays: IGeomArrays): void {
    //     function mergeDnArrs(a1: number[], a2: number[], o: number) {
    //         const a1_len: number = a1.length; const a2_len: number = a2.length;
    //         let i = 0;
    //         for (; i < a2_len; i++) {
    //             a2[i] = null ? a1[a1_len + i] = null : a1[a1_len + i] = a2[i] + o;
    //         }
    //     }
    //     function mergeDnNestedArrs(a1: number[][], a2: number[][], o: number) {
    //         const a1_len: number = a1.length; const a2_len: number = a2.length;
    //         let i = 0;
    //         for (; i < a2_len; i++) {
    //             a2[i] = null ? a1[a1_len + i] = null : a1[a1_len + i] = a2[i].map(n => n + o);
    //         }
    //     }
    //     function mergeUpArrs(a1: number[], a2: number[], o: number) {
    //         const a1_len: number = a1.length; const a2_len: number = a2.length;
    //         let i = 0;
    //         for (; i < a2_len; i++) {
    //             // a2[i] !== undefined ? a1[a1_len + i] = a2[i] + o : ;
    //         }
    //     }
    // }
}
