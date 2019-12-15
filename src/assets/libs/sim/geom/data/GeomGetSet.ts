import { IGeomData } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Get and set the data in this model.
 *
 */
export class GeomGetSet extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    /**
     * Returns the data for this model.
     */
    public getData(repl_undef = false): IGeomData {
        function replUndef(in_arr: any[]): any[] {
            const out_arr: any[] = [];
            for (let i = 0; i < in_arr.length; i++) {
                if (in_arr[i] === undefined) {
                    out_arr[i] = null;
                } else {
                    out_arr[i] = in_arr[i];
                }
            }
            return out_arr;
        }
        if (repl_undef === true) {
            return {
                num_posis: this._geom_arrays.up_posis_verts.length,
                verts: replUndef(this._geom_arrays.dn_verts_posis),
                tris: replUndef(this._geom_arrays.dn_tris_verts),
                edges: replUndef(this._geom_arrays.dn_edges_verts),
                wires: replUndef(this._geom_arrays.dn_wires_edges),
                faces_tris: replUndef(this._geom_arrays.dn_faces_tris),
                faces_wires: replUndef(this._geom_arrays.dn_faces_wires),
                points: replUndef(this._geom_arrays.dn_points_verts),
                plines: replUndef(this._geom_arrays.dn_plines_wires),
                pgons: replUndef(this._geom_arrays.dn_pgons_faces),
                coll_points: replUndef(this._geom_arrays.dn_colls_points),
                coll_plines: replUndef(this._geom_arrays.dn_colls_plines),
                coll_pgons: replUndef(this._geom_arrays.dn_colls_pgons),
                coll_parents: replUndef(this._geom_arrays.up_colls_parents),
                selected: this.geom.selected
            };
        }
        return {
            num_posis: this._geom_arrays.up_posis_verts.length,
            verts: this._geom_arrays.dn_verts_posis,
            tris: this._geom_arrays.dn_tris_verts,
            edges: this._geom_arrays.dn_edges_verts,
            wires: this._geom_arrays.dn_wires_edges,
            faces_tris: this._geom_arrays.dn_faces_tris,
            faces_wires: this._geom_arrays.dn_faces_wires,
            points: this._geom_arrays.dn_points_verts,
            plines: this._geom_arrays.dn_plines_wires,
            pgons: this._geom_arrays.dn_pgons_faces,
            coll_parents: this._geom_arrays.up_colls_parents,
            coll_points: this._geom_arrays.dn_colls_points,
            coll_plines: this._geom_arrays.dn_colls_plines,
            coll_pgons: this._geom_arrays.dn_colls_pgons,
            selected: this.geom.selected
        };
    }
    /**
     * Sets the data in this model.
     * Any existing data in the model is deleted.
     * @param geom_data The data to be set.
     */
    public setData(geom_data: IGeomData, repl_null = false): void {
        function replNull(in_arr: any[]): any[] {
            const out_arr: any[] = [];
            for (let i = 0; i < in_arr.length; i++) {
                if (in_arr[i] !== null) { out_arr[i] = in_arr[i]; }
            }
            return out_arr;
        }
        if (repl_null) {
            // update the down arrays
            // add vertices to model
            this._geom_arrays.dn_verts_posis =  replNull(geom_data.verts);
            // add triangles to model
            this._geom_arrays.dn_tris_verts =  replNull(geom_data.tris);
            // add edges to model
            this._geom_arrays.dn_edges_verts = replNull(geom_data.edges);
            // add wires to model
            this._geom_arrays.dn_wires_edges = replNull(geom_data.wires);
            // add faces to model
            this._geom_arrays.dn_faces_tris = replNull(geom_data.faces_tris);
            this._geom_arrays.dn_faces_wires = replNull(geom_data.faces_wires);
            // add points to model
            this._geom_arrays.dn_points_verts = replNull(geom_data.points);
            // add lines to model
            this._geom_arrays.dn_plines_wires = replNull(geom_data.plines);
            // add pgons to model
            this._geom_arrays.dn_pgons_faces = replNull(geom_data.pgons);
            // add collections to model
            this._geom_arrays.up_colls_parents = replNull(geom_data.coll_parents);
            this._geom_arrays.dn_colls_points = replNull(geom_data.coll_points);
            this._geom_arrays.dn_colls_plines = replNull(geom_data.coll_plines);
            this._geom_arrays.dn_colls_pgons = replNull(geom_data.coll_pgons);
            // set selected
            this.geom.selected = geom_data.selected;
        } else {
            // update the down arrays
            // add vertices to model
            this._geom_arrays.dn_verts_posis =  geom_data.verts;
            // add triangles to model
            this._geom_arrays.dn_tris_verts =  geom_data.tris;
            // add edges to model
            this._geom_arrays.dn_edges_verts = geom_data.edges;
            // add wires to model
            this._geom_arrays.dn_wires_edges = geom_data.wires;
            // add faces to model
            this._geom_arrays.dn_faces_tris = geom_data.faces_tris;
            this._geom_arrays.dn_faces_wires = geom_data.faces_wires;
            // add points to model
            this._geom_arrays.dn_points_verts = geom_data.points;
            // add lines to model
            this._geom_arrays.dn_plines_wires = geom_data.plines;
            // add pgons to model
            this._geom_arrays.dn_pgons_faces = geom_data.pgons;
            // add collections to model
            this._geom_arrays.up_colls_parents = geom_data.coll_parents;
            this._geom_arrays.dn_colls_points = geom_data.coll_points;
            this._geom_arrays.dn_colls_plines = geom_data.coll_plines;
            this._geom_arrays.dn_colls_pgons = geom_data.coll_pgons;
            // set selected
            this.geom.selected = geom_data.selected;
        }

        // update the up arrays
        // many of the values will be undefined
        // they could also be undefined, since we might have saved some data with deleted ents

        // fill up_posis_verts with either null or empty arrays
        // the up_posis_verts array is special, it can have no undefine values
        // its length is used to determine how many posis there are in the model

        // TODO add num_posis

        // posis->verts, create arrays
        this._geom_arrays.up_posis_verts = [];
        let posi_i = 0; const posi_i_max = geom_data.num_posis;
        for (; posi_i < posi_i_max; posi_i++) {
            if (this.geom.model.attribs.query.getPosiCoords(posi_i) === undefined) {
                this._geom_arrays.up_posis_verts[posi_i] = null;
            } else {
                this._geom_arrays.up_posis_verts[posi_i] = [];
            }
        }
        // posis->verts
        this._geom_arrays.dn_verts_posis.forEach( (_posi_i, vert_i) => { // val, index
            if (_posi_i !== undefined) {
                this._geom_arrays.up_posis_verts[_posi_i].push(vert_i);
            }
        });
        // verts->tris, one to many
        this._geom_arrays.up_verts_tris = [];
        this._geom_arrays.dn_tris_verts.forEach( (vert_i_arr, tri_i) => { // val, index
            if (vert_i_arr !== undefined) {
                vert_i_arr.forEach( vert_i => {
                    if (this._geom_arrays.up_verts_tris[vert_i] === undefined) {
                        this._geom_arrays.up_verts_tris[vert_i] = [];
                    }
                    this._geom_arrays.up_verts_tris[vert_i].push(tri_i);
                });
            }
        });
        // verts->edges, one to two
        // order is important
        this._geom_arrays.up_verts_edges = [];
        this._geom_arrays.dn_edges_verts.forEach( (vert_pair_i, edge_i) => { // val, index
            if (vert_pair_i !== undefined) {
                vert_pair_i.forEach( (vert_i, index) => {
                    if (this._geom_arrays.up_verts_edges[vert_i] === undefined) {
                        this._geom_arrays.up_verts_edges[vert_i] = [null, null];
                    }
                    if (index === 0) {
                        this._geom_arrays.up_verts_edges[vert_i][1] = edge_i;
                    } else if (index === 1) {
                        this._geom_arrays.up_verts_edges[vert_i][0] = edge_i;
                    }
                    if (index > 1) {
                        throw new Error('Import data error: Found an edge with more than two vertices.');
                    }
                });
            }
        });
        // edges->wires
        this._geom_arrays.up_edges_wires = [];
        this._geom_arrays.dn_wires_edges.forEach( (edge_i_arr, wire_i) => { // val, index
            if (edge_i_arr !== undefined) {
                edge_i_arr.forEach( edge_i => {
                    this._geom_arrays.up_edges_wires[edge_i] = wire_i;
                });
            }
        });
        // wires->faces
        this._geom_arrays.up_wires_faces = [];
        this._geom_arrays.up_tris_faces = [];
        this._geom_arrays.dn_faces_wires.forEach( (face_wires, face_i) => { // val, index
            if (face_wires !== undefined) {
                face_wires.forEach( wire_i => {
                    this._geom_arrays.up_wires_faces[wire_i] = face_i;
                });
            }
        });
        // tris->faces
        this._geom_arrays.up_wires_faces = [];
        this._geom_arrays.up_tris_faces = [];
        this._geom_arrays.dn_faces_tris.forEach( (face_tris, face_i) => { // val, index
            if (face_tris !== undefined) {
                face_tris.forEach( tri_i => {
                    this._geom_arrays.up_tris_faces[tri_i] = face_i;
                });
            }
        });
        // points, lines, polygons
        this._geom_arrays.up_verts_points = [];
        this._geom_arrays.dn_points_verts.forEach( (vert_i, point_i) => { // val, index
            if (vert_i !== undefined) {
                this._geom_arrays.up_verts_points[vert_i] = point_i;
            }
        });
        this._geom_arrays.up_wires_plines = [];
        this._geom_arrays.dn_plines_wires.forEach( (wire_i, line_i) => { // val, index
            if (wire_i !== undefined) {
                this._geom_arrays.up_wires_plines[wire_i] = line_i;
            }
        });
        this._geom_arrays.up_faces_pgons = [];
        this._geom_arrays.dn_pgons_faces.forEach( (face_i, pgon_i) => { // val, index
            if (face_i !== undefined) {
                this._geom_arrays.up_faces_pgons[face_i] = pgon_i;
            }
        });
        // collections of points, polylines, polygons
        this._geom_arrays.up_points_colls = [];
        this._geom_arrays.up_plines_colls = [];
        this._geom_arrays.up_pgons_colls = [];
        // TODO put these all in one loop
        this._geom_arrays.dn_colls_points.forEach( (coll_points, coll_i) => { // val, index
            if (coll_points !== undefined) {
                coll_points.forEach( point_i => {
                    if (this._geom_arrays.up_points_colls[point_i] === undefined) {
                        this._geom_arrays.up_points_colls[point_i] = [coll_i];
                    } else {
                        this._geom_arrays.up_points_colls[point_i].push(coll_i);
                    }
                });
            }
        });
        this._geom_arrays.dn_colls_plines.forEach( (coll_plines, coll_i) => { // val, index
            if (coll_plines !== undefined) {
                coll_plines.forEach( pline_i => {
                    if (this._geom_arrays.up_plines_colls[pline_i] === undefined) {
                        this._geom_arrays.up_plines_colls[pline_i] = [coll_i];
                    } else {
                        this._geom_arrays.up_plines_colls[pline_i].push(coll_i);
                    }
                });
            }
        });
        this._geom_arrays.dn_colls_pgons.forEach( (coll_plines, coll_i) => { // val, index
            if (coll_plines !== undefined) {
                coll_plines.forEach( pgon_i => {
                    if (this._geom_arrays.up_pgons_colls[pgon_i] === undefined) {
                        this._geom_arrays.up_pgons_colls[pgon_i] = [coll_i];
                    } else {
                        this._geom_arrays.up_pgons_colls[pgon_i].push(coll_i);
                    }
                });
            }
        });
    }
}
