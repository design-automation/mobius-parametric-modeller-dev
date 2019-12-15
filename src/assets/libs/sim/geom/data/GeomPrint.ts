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
        console.log(
            '\n------------------------------------------------------------ \n',
            '\n' + msg + '\n',
            '\nGEOM DATA',
            '\nnum_posis', this._geom_arrays.up_posis_verts.length,
            '\nselected', JSON.stringify(this.geom.selected),
            '\nGEOM DOWN ARRAYS',
            '\n_01_dn_verts_posis', JSON.stringify(this._geom_arrays.dn_verts_posis),
            '\n_02_dn_tris_verts', JSON.stringify(this._geom_arrays.dn_tris_verts),
            '\n_03_dn_edges_verts', JSON.stringify(this._geom_arrays.dn_edges_verts),
            '\n_04_dn_wires_edges', JSON.stringify(this._geom_arrays.dn_wires_edges),
            '\n_05_dn_faces_tris', JSON.stringify(this._geom_arrays.dn_faces_tris),
            '\n_06_dn_faces_wires', JSON.stringify(this._geom_arrays.dn_faces_wires),
            '\n_07_dn_points_verts', JSON.stringify(this._geom_arrays.dn_points_verts),
            '\n_08_dn_plines_wires', JSON.stringify(this._geom_arrays.dn_plines_wires),
            '\n_09_dn_pgons_faces', JSON.stringify(this._geom_arrays.dn_pgons_faces),
            '\n_10_dn_colls_points', JSON.stringify(this._geom_arrays.dn_colls_points),
            '\n_11_dn_colls_plines', JSON.stringify(this._geom_arrays.dn_colls_plines),
            '\n_12_dn_colls_pgons', JSON.stringify(this._geom_arrays.dn_colls_pgons),
            '\nGEOM UP ARRAYS',
            '\n_01_up_posis_verts', JSON.stringify(this._geom_arrays.up_posis_verts),
            '\n_02_up_verts_tris', JSON.stringify(this._geom_arrays.up_verts_tris),
            '\n_03_up_verts_edges', JSON.stringify(this._geom_arrays.up_verts_edges),
            '\n_04_up_edges_wires', JSON.stringify(this._geom_arrays.up_edges_wires),
            '\n_05_up_wires_faces', JSON.stringify(this._geom_arrays.up_wires_faces),
            '\n_06_up_tris_faces', JSON.stringify(this._geom_arrays.up_tris_faces),
            '\n_07_up_vert_points', JSON.stringify(this._geom_arrays.up_verts_points),
            '\n_08_up_wire_plines', JSON.stringify(this._geom_arrays.up_wires_plines),
            '\n_09_up_faces_pgons', JSON.stringify(this._geom_arrays.up_faces_pgons),
            '\n_10_up_points_colls', JSON.stringify(this._geom_arrays.up_points_colls),
            '\n_11_up_plines_colls', JSON.stringify(this._geom_arrays.up_plines_colls),
            '\n_12_up_pgons_colls', JSON.stringify(this._geom_arrays.up_pgons_colls),
            '\n_13_up_colls_parents', JSON.stringify(this._geom_arrays.up_colls_parents),
        );
    }
}
