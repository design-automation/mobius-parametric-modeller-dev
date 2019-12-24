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
    public print(msg: string): void {
        function arrStr(arr: any[]): string {
            const new_arr: any[] = [];
            let num_empty = 0;
            for (let i = 0; i < arr.length; i++) {
                if (i in arr) {
                    if (num_empty !== 0) {
                        new_arr.push('empty x ' + num_empty);
                        num_empty = 0;
                    }
                    new_arr.push(arr[i]);
                } else {
                    num_empty++;
                }
            }
            return JSON.stringify(new_arr).replace(/,/g, ', ');
        }
        console.log(
            '\n------------------------------------------------------------ \n',
            '\n' + msg + '\n',
            '\nGEOM DATA',
            '\n---------',
            '\nnum_posis', this._geom_arrays.up_posis_verts.length,
            '\nselected\t', arrStr(this.geom.selected),
            '\nGEOM DOWN ARRAYS',
            '\n----------------',
            '\ndn_verts_posis\t', arrStr(this._geom_arrays.dn_verts_posis),
            '\ndn_tris_verts\t', arrStr(this._geom_arrays.dn_tris_verts),
            '\ndn_edges_verts\t', arrStr(this._geom_arrays.dn_edges_verts),
            '\ndn_wires_edges\t', arrStr(this._geom_arrays.dn_wires_edges),
            '\ndn_faces_tris\t', arrStr(this._geom_arrays.dn_faces_tris),
            '\ndn_faces_wires\t', arrStr(this._geom_arrays.dn_faces_wires),
            '\ndn_points_verts\t', arrStr(this._geom_arrays.dn_points_verts),
            '\ndn_plines_wires\t', arrStr(this._geom_arrays.dn_plines_wires),
            '\ndn_pgons_faces\t', arrStr(this._geom_arrays.dn_pgons_faces),
            '\ndn_colls_points\t', arrStr(this._geom_arrays.dn_colls_points),
            '\ndn_colls_plines\t', arrStr(this._geom_arrays.dn_colls_plines),
            '\ndn_colls_pgons\t', arrStr(this._geom_arrays.dn_colls_pgons),
            '\nGEOM UP ARRAYS',
            '\n--------------',
            '\nup_posis_verts\t', arrStr(this._geom_arrays.up_posis_verts),
            '\nup_verts_tris\t', arrStr(this._geom_arrays.up_verts_tris),
            '\nup_verts_edges\t', arrStr(this._geom_arrays.up_verts_edges),
            '\nup_edges_wires\t', arrStr(this._geom_arrays.up_edges_wires),
            '\nup_wires_faces\t', arrStr(this._geom_arrays.up_wires_faces),
            '\nup_tris_faces\t', arrStr(this._geom_arrays.up_tris_faces),
            '\nup_vert_points\t', arrStr(this._geom_arrays.up_verts_points),
            '\nup_wire_plines\t', arrStr(this._geom_arrays.up_wires_plines),
            '\nup_faces_pgons\t', arrStr(this._geom_arrays.up_faces_pgons),
            '\nup_points_colls\t', arrStr(this._geom_arrays.up_points_colls),
            '\nup_plines_colls\t', arrStr(this._geom_arrays.up_plines_colls),
            '\nup_pgons_colls\t', arrStr(this._geom_arrays.up_pgons_colls),
            '\nup_colls_parents\t', arrStr(this._geom_arrays.up_colls_parents)
        );
    }
}
