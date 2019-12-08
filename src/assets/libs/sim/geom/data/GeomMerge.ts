import { TTri, TVert, TEdge, TWire, TFace,
    TColl, TPoint, TPline, TPgon, IGeomArrays, IGeomPack, TFaceWire, TFaceTri } from '../../common';
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
        const geom_arrays: IGeomArrays = geom.data._geom_arrays;
        // get lengths of existing entities before we start adding stuff
        // const num_posis: number = this._geom_arrays.num_posis;
        // const num_posis: number = this.geom.data.numPosis();
        // const num_verts: number = this.geom.data.numVerts();
        // const num_tris: number = this.geom.data.numTris();
        // const num_edges: number = this.geom.data.numEdges();
        // const num_wires: number = this.geom.data.numWires();
        // const num_faces: number = this.geom.data.numFaces();
        // const num_points: number = this.geom.data.numPoints();
        // const num_plines: number = this.geom.data.numPlines();
        // const num_pgons: number = this.geom.data.numPgons();
        // const num_colls: number = this.geom.data.numColls();

        const num_posis: number = this._geom_arrays.up_posis_verts.length;
        const num_verts: number = this._geom_arrays.dn_verts_posis.length;
        const num_tris: number = this._geom_arrays.dn_tris_verts.length;
        const num_edges: number = this._geom_arrays.dn_edges_verts.length;
        const num_wires: number = this._geom_arrays.dn_wires_edges.length;
        const num_faces: number = this._geom_arrays.dn_faces_wires.length;
        const num_points: number = this._geom_arrays.dn_points_verts.length;
        const num_plines: number = this._geom_arrays.dn_plines_wires.length;
        const num_pgons: number = this._geom_arrays.dn_pgons_faces.length;
        const num_colls: number = this._geom_arrays.dn_colls_parents.length;


        // for the down arrays, it is important the values are never undefined
        // undefined cannot be exported as json
        // if anything is deleted, then the value should be null

        // add vertices to model
        for (const posi_i of geom_arrays.dn_verts_posis) {
            if (posi_i === null) {
                this._geom_arrays.dn_verts_posis.push( null );
            } else {
                const new_vert: TVert = posi_i + num_posis as TVert;
                this._geom_arrays.dn_verts_posis.push( new_vert );
            }
        }
        // add triangles to model
        for (const verts_i of geom_arrays.dn_tris_verts) {
            if (verts_i === null) {
                this._geom_arrays.dn_tris_verts.push( null );
            } else {
                const new_triangle: TTri = verts_i.map(v => v + num_verts) as TTri;
                this._geom_arrays.dn_tris_verts.push( new_triangle );
            }
        }
        // add edges to model
        for (const verts_i of geom_arrays.dn_edges_verts) {
            if (verts_i === null) {
                this._geom_arrays.dn_edges_verts.push( null );
            } else {
                const new_edge: TEdge = verts_i.map(v => v + num_verts) as TEdge;
                this._geom_arrays.dn_edges_verts.push( new_edge );
            }
        }
        // add wires to model
        for (const edges_i of geom_arrays.dn_wires_edges) {
            if (edges_i === null) {
                this._geom_arrays.dn_wires_edges.push( null );
            } else {
                const new_wire: TWire = edges_i.map(e => e + num_edges) as TWire;
                this._geom_arrays.dn_wires_edges.push( new_wire );
            }
        }
        // add faces wires to model
        for (const wires_i of geom_arrays.dn_faces_wires) {
            if (wires_i === null) {
                this._geom_arrays.dn_faces_wires.push( null );
            } else {
                const new_face_wires: TFaceWire = wires_i.map( w => w + num_wires );
                this._geom_arrays.dn_faces_wires.push( new_face_wires );
            }
        }
        // add faces tris to model
        for (const tris_i of geom_arrays.dn_faces_tris) {
            if (tris_i === null) {
                this._geom_arrays.dn_faces_wires.push( null );
            } else {
                const new_face_tris: TFaceTri = tris_i.map( t => t + num_tris );
                this._geom_arrays.dn_faces_tris.push( new_face_tris );
            }
        }
        // add points to model
        for (const vert_i of geom_arrays.dn_points_verts) {
            if (vert_i === null) {
                this._geom_arrays.dn_points_verts.push( null );
            } else {
                const new_point: TPoint = vert_i + num_verts as TPoint;
                this._geom_arrays.dn_points_verts.push( new_point );
            }
        }
        // add plines to model
        for (const wire_i of geom_arrays.dn_plines_wires) {
            if (wire_i === null) {
                this._geom_arrays.dn_plines_wires.push( null );
            } else {
                const new_pline: TPline = wire_i + num_wires as TPline;
                this._geom_arrays.dn_plines_wires.push( new_pline );
            }
        }
        // add pgons to model
        for (const face_i of geom_arrays.dn_pgons_faces) {
            if (face_i === null) {
                this._geom_arrays.dn_pgons_faces.push( null );
            } else {
                const new_pgon: TPgon = face_i + num_faces as TPgon;
                this._geom_arrays.dn_pgons_faces.push( new_pgon );
            }
        }
        // add collections parents to model
        for (const coll_parent_i of geom_arrays.dn_colls_parents) {
            if (coll_parent_i === null) { // TODO null means no parent <<<<<<<<<<<
                this._geom_arrays.dn_colls_parents.push( null );
            } else {
                const new_coll_parent_i: number = (coll_parent_i === undefined) ? undefined : coll_parent_i + num_colls;
                this._geom_arrays.dn_colls_parents.push( new_coll_parent_i );
            }
        }
        // add collections points to model
        for (const coll_points_i of geom_arrays.dn_colls_points) {
            if (coll_points_i === null) {
                this._geom_arrays.dn_colls_points.push( null );
            } else {
                const new_coll_points_i: number[] = coll_points_i.map( point => point + num_points);
                this._geom_arrays.dn_colls_points.push( new_coll_points_i );
            }
        }
        // add collections plines to model
        for (const coll_plines_i of geom_arrays.dn_colls_plines) {
            if (coll_plines_i === null) {
                this._geom_arrays.dn_colls_plines.push( null );
            } else {
                const new_coll_points_i: number[] = coll_plines_i.map( pline => pline + num_plines);
                this._geom_arrays.dn_colls_plines.push( new_coll_points_i );
            }
        }
        // add collections pgons to model
        for (const coll_pgons_i of geom_arrays.dn_colls_pgons) {
            if (coll_pgons_i === null) {
                this._geom_arrays.dn_colls_pgons.push( null );
            } else {
                const new_coll_pgons_i: number[] = coll_pgons_i.map( pgon => pgon + num_pgons);
                this._geom_arrays.dn_colls_pgons.push( new_coll_pgons_i );
            }
        }
        // update reverse arrays

        // undefined = no value
        // in typescript, undefined behaves in strange ways, try this
        //     const x = [0, undefined, 2, , 4];
        //     for (const i of x) { console.log("i in for loop:", i);}
        //     x.forEach(i => console.log("i in foreach loop:", i) );
        // for the undefined values, explicitly setting the value to undefined is not the same as not setting it at all
        // with a foreach loop, if there is no value, then it skips it completley
        // in this case, we want to make sure there is no value

        // update posis to verts (they can be null or [])
        let pv_i = 0; const pv_i_max = geom_arrays.up_posis_verts.length;
        for (; pv_i < pv_i_max; pv_i++) {
            const verts_i: number[] = geom_arrays.up_posis_verts[pv_i];
            if (verts_i === undefined) {
                continue;
            } else if (verts_i === null) {
                this._geom_arrays.up_posis_verts[pv_i + num_posis] = null;
            } else {
                const new_verts_i: number[] = verts_i.map( vert_i => vert_i + num_verts);
                this._geom_arrays.up_posis_verts[pv_i + num_posis] = new_verts_i;
            }
        }
        // update verts to tris
        let vt_i = 0; const vt_i_max = geom_arrays.up_verts_tris.length;
        for (; vt_i < vt_i_max; vt_i++) {
            const tris_i: number[] = geom_arrays.up_verts_tris[vt_i];
            if (tris_i === undefined) {
                continue;
            } else if (tris_i === null) {
                this._geom_arrays.up_verts_tris[vt_i + num_verts] = null;
            } else {
                const new_tris_i: number[] = tris_i.map( tri_i => tri_i + num_tris);
                this._geom_arrays.up_verts_tris[vt_i + num_verts] = new_tris_i;
            }
        }
        // update tris to faces
        let tf_i = 0; const tf_i_max = geom_arrays.up_tris_faces.length;
        for (; tf_i < tf_i_max; tf_i++) {
            const face_i: number = geom_arrays.up_tris_faces[tf_i];
            if (face_i === undefined) {
                continue;
            } else if (face_i === null) {
                this._geom_arrays.up_tris_faces[tf_i + num_tris] = null;
            } else {
                const new_face_i: number = face_i + num_faces;
                this._geom_arrays.up_tris_faces[tf_i + num_tris] = new_face_i;
            }
        }
        // update verts to edges
        let ve_i = 0; const ve_i_max = geom_arrays.up_verts_edges.length;
        for (; ve_i < ve_i_max; ve_i++) {
            const edges_i: [number, number] = geom_arrays.up_verts_edges[ve_i];
            if (edges_i === undefined) {
                continue;
            } else if (edges_i === null) {
                this._geom_arrays.up_verts_edges[ve_i + num_verts] = null;
            } else {
                let edge0_i: number = edges_i[0];
                if (edge0_i !== null) { edge0_i = edge0_i + num_edges; } // TODO check if this is right
                let edge1_i: number = edges_i[1];
                if (edge1_i !== null) { edge1_i = edge1_i + num_edges; }
                this._geom_arrays.up_verts_edges[ve_i + num_verts] = [edge0_i, edge1_i];
            }
        }
        // update edges to wires
        let ew_i = 0; const ew_i_max = geom_arrays.up_edges_wires.length;
        for (; ew_i < ew_i_max; ew_i++) {
            const wire_i: number = geom_arrays.up_edges_wires[ew_i];
            if (wire_i === undefined) {
                continue;
            } else if (wire_i === null) {
                this._geom_arrays.up_edges_wires[ew_i + num_edges] = null;
            } else {
                const new_wire_i: number = wire_i + num_wires;
                this._geom_arrays.up_edges_wires[ew_i + num_edges] = new_wire_i;
            }
        }
        // update wires to faces
        let wf_i = 0; const wf_i_max = geom_arrays.up_wires_faces.length;
        for (; wf_i < wf_i_max; wf_i++) {
            const face_i: number = geom_arrays.up_wires_faces[wf_i];
            if (face_i === undefined) {
                continue;
            } else if (face_i === null) {
                this._geom_arrays.up_wires_faces[wf_i + num_wires] = null;
            } else {
                const new_face_i: number = face_i + num_faces;
                this._geom_arrays.up_wires_faces[wf_i + num_wires] = new_face_i;
            }
        }
        // update verts to points
        let vp_i = 0; const vp_i_max = geom_arrays.up_verts_points.length;
        for (; vp_i < vp_i_max; vp_i++) {
            const point_i: number = geom_arrays.up_verts_points[vp_i];
            if (point_i === undefined) {
                continue;
            } else if (point_i === null) {
                this._geom_arrays.up_verts_points[vp_i + num_points] = null;
            } else {
                const new_point_i: number = point_i + num_points;
                this._geom_arrays.up_verts_points[vp_i + num_points] = new_point_i;
            }
        }
        // update wires to plines
        let wp_i = 0; const wp_i_max = geom_arrays.up_wires_plines.length;
        for (; wp_i < wp_i_max; wp_i++) {
            const pline_i: number = geom_arrays.up_wires_plines[wp_i];
            if (pline_i === undefined) {
                continue;
            } else if (pline_i === null) {
                this._geom_arrays.up_wires_plines[wp_i + num_wires] = null;
            } else {
                const new_pline_i: number = pline_i + num_plines;
                this._geom_arrays.up_wires_plines[wp_i + num_wires] = new_pline_i;
            }
        }
        // update faces to pgons
        let fp_i = 0; const fp_i_max = geom_arrays.up_faces_pgons.length;
        for (; fp_i < fp_i_max; fp_i++) {
            const pgon_i: number = geom_arrays.up_faces_pgons[fp_i];
            if (pgon_i === undefined) {
                continue;
            } else if (pgon_i === null) {
                this._geom_arrays.up_faces_pgons[fp_i + num_faces] = null;
            } else {
                const new_pgon_i: number = pgon_i + num_pgons;
                this._geom_arrays.up_faces_pgons[fp_i + num_faces] = new_pgon_i;
            }
        }
        // update points to colls
        let poc_i = 0; const poc_i_max = geom_arrays.up_points_colls.length;
        for (; poc_i < poc_i_max; poc_i++) {
            const colls_i: number[] = geom_arrays.up_points_colls[poc_i];
            if (colls_i === undefined) {
                continue;
            } else if (colls_i === null) {
                this._geom_arrays.up_points_colls[poc_i + num_points] = null;
            } else {
                const new_colls_i: number[] = colls_i.map(coll_i => coll_i + num_colls);
                this._geom_arrays.up_points_colls[poc_i + num_points] = new_colls_i;
            }
        }
        // update plines to colls
        let plc_i = 0; const plc_i_max = geom_arrays.up_plines_colls.length;
        for (; plc_i < plc_i_max; plc_i++) {
            const colls_i: number[] = geom_arrays.up_plines_colls[plc_i];
            if (colls_i === undefined) {
                continue;
            } else if (colls_i === null) {
                this._geom_arrays.up_plines_colls[plc_i + num_plines] = null;
            } else {
                const new_colls_i: number[] = colls_i.map(coll_i => coll_i + num_colls);
                this._geom_arrays.up_plines_colls[plc_i + num_plines] = new_colls_i;
            }
        }
        // update pgons to colls
        let pgc_i = 0; const pgc_i_max = geom_arrays.up_pgons_colls.length;
        for (; pgc_i < pgc_i_max; pgc_i++) {
            const colls_i: number[] = geom_arrays.up_pgons_colls[pgc_i];
            if (colls_i === undefined) {
                continue;
            } else if (colls_i === null) {
                this._geom_arrays.up_pgons_colls[pgc_i + num_pgons] = null;
            } else {
                const new_colls_i: number[] = colls_i.map(coll_i => coll_i + num_colls);
                this._geom_arrays.up_pgons_colls[pgc_i + num_pgons] = new_colls_i;
            }
        }
    }

    /**
     * Returns the JSON data for this model.
     * Experimetal/// TODO
     */
    public merge2(geom_arrays: IGeomArrays): void {
        function mergeDnArrs(a1: number[], a2: number[], o: number) {
            const a1_len: number = a1.length; const a2_len: number = a2.length;
            let i = 0;
            for (; i < a2_len; i++) {
                a2[i] = null ? a1[a1_len + i] = null : a1[a1_len + i] = a2[i] + o;
            }
        }
        function mergeDnNestedArrs(a1: number[][], a2: number[][], o: number) {
            const a1_len: number = a1.length; const a2_len: number = a2.length;
            let i = 0;
            for (; i < a2_len; i++) {
                a2[i] = null ? a1[a1_len + i] = null : a1[a1_len + i] = a2[i].map(n => n + o);
            }
        }
        function mergeUpArrs(a1: number[], a2: number[], o: number) {
            const a1_len: number = a1.length; const a2_len: number = a2.length;
            let i = 0;
            for (; i < a2_len; i++) {
                // a2[i] !== undefined ? a1[a1_len + i] = a2[i] + o : ;
            }
        }
    }
}
