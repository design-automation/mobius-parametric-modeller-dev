import { Geom } from '../Geom';
import { GeomBase } from './GeomBase';

/**
 * Print the data arrays, for debugging purposes
 *
 */
export class GeomPrint extends GeomBase {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    /**
     * For debugging
     */
    public printArrays(msg: string): void {
        const replacer = (k, v) => v === undefined ? 'undef' : v;
        console.log(
            '\n------------------------------------------------------------ \n',
            '\n' + msg + '\n',
            '\nGEOM DATA',
            '\nnum_posis', this._geom_arrays.up_posis_verts.length,
            '\nselected\t', JSON.stringify(this.geom.selected),
            '\nGEOM DOWN ARRAYS',
            '\ndn_verts_posis\t', JSON.stringify(this._geom_arrays.dn_verts_posis, replacer),
            '\ndn_tris_verts\t', JSON.stringify(this._geom_arrays.dn_tris_verts, replacer),
            '\ndn_edges_verts\t', JSON.stringify(this._geom_arrays.dn_edges_verts, replacer),
            '\ndn_wires_edges\t', JSON.stringify(this._geom_arrays.dn_wires_edges, replacer),
            '\ndn_faces_tris\t', JSON.stringify(this._geom_arrays.dn_faces_tris, replacer),
            '\ndn_faces_wires\t', JSON.stringify(this._geom_arrays.dn_faces_wires, replacer),
            '\ndn_points_verts\t', JSON.stringify(this._geom_arrays.dn_points_verts, replacer),
            '\ndn_plines_wires\t', JSON.stringify(this._geom_arrays.dn_plines_wires, replacer),
            '\ndn_pgons_faces\t', JSON.stringify(this._geom_arrays.dn_pgons_faces, replacer),
            '\ndn_colls_points\t', JSON.stringify(this._geom_arrays.dn_colls_points, replacer),
            '\ndn_colls_plines\t', JSON.stringify(this._geom_arrays.dn_colls_plines, replacer),
            '\ndn_colls_pgons\t', JSON.stringify(this._geom_arrays.dn_colls_pgons, replacer),
            '\nGEOM UP ARRAYS',
            '\nup_posis_verts\t', JSON.stringify(this._geom_arrays.up_posis_verts, replacer),
            '\nup_verts_tris\t', JSON.stringify(this._geom_arrays.up_verts_tris, replacer),
            '\nup_verts_edges\t', JSON.stringify(this._geom_arrays.up_verts_edges, replacer),
            '\nup_edges_wires\t', JSON.stringify(this._geom_arrays.up_edges_wires, replacer),
            '\nup_wires_faces\t', JSON.stringify(this._geom_arrays.up_wires_faces, replacer),
            '\nup_tris_faces\t', JSON.stringify(this._geom_arrays.up_tris_faces, replacer),
            '\nup_vert_points\t', JSON.stringify(this._geom_arrays.up_verts_points, replacer),
            '\nup_wire_plines\t', JSON.stringify(this._geom_arrays.up_wires_plines, replacer),
            '\nup_faces_pgons\t', JSON.stringify(this._geom_arrays.up_faces_pgons, replacer),
            '\nup_points_colls\t', JSON.stringify(this._geom_arrays.up_points_colls, replacer),
            '\nup_plines_colls\t', JSON.stringify(this._geom_arrays.up_plines_colls, replacer),
            '\nup_pgons_colls\t', JSON.stringify(this._geom_arrays.up_pgons_colls, replacer),
            '\nup_colls_parents\t', JSON.stringify(this._geom_arrays.up_colls_parents, replacer)
        );
    }
}
