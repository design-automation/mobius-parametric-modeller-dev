// the Geom class
import { Geom } from '../Geom';
// classes to extend
import { GeomNav } from './GeomNav';
// classes to inherit from via mixins
import { GeomAdd } from './GeomAdd';
import { GeomColl } from './GeomColl';
import { GeomEnt } from './GeomEnt';
import { GeomFace } from './GeomFace';
import { GeomIns } from './GeomUpdate';
import { GeomLink } from './GeomLink';
import { GeomPack } from './GeomPack';
import { GeomPosi } from './GeomPosi';
import { GeomRem } from './GeomRem';
import { GeomRev } from './GeomRev';
import { GeomTree } from './GeomTree';
import { GeomVert } from './GeomVert';
import { GeomWire } from './GeomWire';
import { GeomMerge } from './GeomMerge';
import { GeomCheck } from './GeomCheck';
// others
import { IGeomArrays, TFace, Txyz, TTri, IGeomData, IGeomPack, TFaceWire, TFaceTri } from '../../common';
import { triangulate } from '@assets/libs/triangulate/triangulate';

/**
 * Class that inherits all the other classes using mixins
 *
 */
export class GeomData extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    // ============================================================================
    // Get and Set the data in the model
    // ============================================================================
    /**
     * Returns the data for this model.
     */
    public getData(): IGeomData {
        return {
            num_posis: this._geom_arrays.up_posis_verts.length,
            tris: this._geom_arrays.dn_tris_verts,
            verts: this._geom_arrays.dn_verts_posis,
            edges: this._geom_arrays.dn_edges_verts,
            wires: this._geom_arrays.dn_wires_edges,
            faces_tris: this._geom_arrays.dn_faces_tris,
            faces_wires: this._geom_arrays.dn_faces_wires,
            points: this._geom_arrays.dn_points_verts,
            plines: this._geom_arrays.dn_plines_wires,
            pgons: this._geom_arrays.dn_pgons_faces,
            coll_parents: this._geom_arrays.dn_colls_parents,
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
    public setData(geom_data: IGeomData): void {
        // update the down arrays
        // these are assumed never to undefined
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
        this._geom_arrays.dn_colls_parents = geom_data.coll_parents;
        this._geom_arrays.dn_colls_points = geom_data.coll_points;
        this._geom_arrays.dn_colls_plines = geom_data.coll_plines;
        this._geom_arrays.dn_colls_pgons = geom_data.coll_pgons;
        // set selected
        this.geom.selected = geom_data.selected;

        // update the up arrays
        // many of the values will be undefined
        // they could be null, since we might have saved some data with deleted ents

        // fill up_posis_verts with either null or empty arrays
        // the up_posis_verts array is special, it can have no undefine values
        // its length is used to determine how many posis there are in the model
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
            if (_posi_i !== null) {


                // console.log(">> posi_i", _posi_i)
                // console.log(">> vert_i", this._geom_arrays.up_posis_verts[_posi_i])

                this._geom_arrays.up_posis_verts[_posi_i].push(vert_i);
            }
        });
        // verts->tris, one to many
        this._geom_arrays.up_verts_tris = [];
        this._geom_arrays.dn_tris_verts.forEach( (vert_i_arr, tri_i) => { // val, index
            if (vert_i_arr !== null) {
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
            if (vert_pair_i !== null) {
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
            if (edge_i_arr !== null) {
                edge_i_arr.forEach( edge_i => {
                    this._geom_arrays.up_edges_wires[edge_i] = wire_i;
                });
            }
        });
        // wires->faces
        this._geom_arrays.up_wires_faces = [];
        this._geom_arrays.up_tris_faces = [];
        this._geom_arrays.dn_faces_wires.forEach( (face_wires, face_i) => { // val, index
            if (face_wires !== null) {
                face_wires.forEach( wire_i => {
                    this._geom_arrays.up_wires_faces[wire_i] = face_i;
                });
            }
        });
        // tris->faces
        this._geom_arrays.up_wires_faces = [];
        this._geom_arrays.up_tris_faces = [];
        this._geom_arrays.dn_faces_tris.forEach( (face_tris, face_i) => { // val, index
            if (face_tris !== null) {
                face_tris.forEach( tri_i => {
                    this._geom_arrays.up_tris_faces[tri_i] = face_i;
                });
            }
        });
        // points, lines, polygons
        this._geom_arrays.up_verts_points = [];
        this._geom_arrays.dn_points_verts.forEach( (vert_i, point_i) => { // val, index
            if (vert_i !== null) {
                this._geom_arrays.up_verts_points[vert_i] = point_i;
            }
        });
        this._geom_arrays.up_wires_plines = [];
        this._geom_arrays.dn_plines_wires.forEach( (wire_i, line_i) => { // val, index
            if (wire_i !== null) {
                this._geom_arrays.up_wires_plines[wire_i] = line_i;
            }
        });
        this._geom_arrays.up_faces_pgons = [];
        this._geom_arrays.dn_pgons_faces.forEach( (face_i, pgon_i) => { // val, index
            if (face_i !== null) {
                this._geom_arrays.up_faces_pgons[face_i] = pgon_i;
            }
        });
        // collections of points, polylines, polygons
        this._geom_arrays.up_points_colls = [];
        this._geom_arrays.up_plines_colls = [];
        this._geom_arrays.up_pgons_colls = [];
        // TODO put these all in one loop
        this._geom_arrays.dn_colls_points.forEach( (coll_points, coll_i) => { // val, index
            if (coll_points !== null) {
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
            if (coll_plines !== null) {
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
            if (coll_plines !== null) {
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
    // ============================================================================
    // Cut holes in faces and triangulate faces
    // TODO Move this out of the data section
    // ============================================================================
    /**
     * Triangulate a polygon.
     *
     * The input polygon may not have any triangles.
     */
    public faceTri(face_i: number): void {
        const face_wires: TFaceWire = this._geom_arrays.dn_faces_wires[face_i];
        const old_face_tris: TFaceTri = this._geom_arrays.dn_faces_tris[face_i];
        // get boundary and holes
        const outer_i: number = face_wires[0];
        const holes_i: number[] = face_wires.slice(1);
        // create the triangles
        const new_face_tris_i: number[] = this._createTris(outer_i, holes_i);
        // delete the old trianges
        for (const old_face_tri_i of old_face_tris) {
            this.remTriEnt(old_face_tri_i);
            this.unlinkFaceTri(face_i, old_face_tri_i);
        }
        for (const new_face_tri_i of new_face_tris_i) {
            this.linkFaceTri(face_i, new_face_tri_i);
        }
    }
    /**
     * Adds a hole to a face and updates the arrays.
     * Wires are assumed to be closed!
     * This also calls addTris()
     * TODO  - remove this method
     */
    public faceCutHoles(face_i: number, hole_wires_i: number[]): number {
        // get the wires and triangles arrays
        const face_wires_i: number[] = this._geom_arrays.dn_faces_wires[face_i];
        const old_face_tris_i: number[] = this._geom_arrays.dn_faces_tris[face_i];
        // get the outer wire
        const outer_wire_i: number = face_wires_i[0];
        // get the hole wires
        const all_hole_wires_i: number[] = [];
        if (face_wires_i.length > 1) {
            face_wires_i.slice(1).forEach(wire_i => all_hole_wires_i.push(wire_i));
        }
        hole_wires_i.forEach(wire_i => all_hole_wires_i.push(wire_i));
        // create the triangles
        const new_tris_i: number[] = this._createTris(outer_wire_i, all_hole_wires_i);
        // create the face
        const new_wires_i: number[] = face_wires_i.concat(hole_wires_i);
        const new_face: TFace = [new_wires_i, new_tris_i];
        // update down arrays
        this._geom_arrays.dn_faces_wires[face_i] = new_face[0];
        this._geom_arrays.dn_faces_tris[face_i] = new_face[1];
        // update up arrays
        hole_wires_i.forEach(hole_wire_i => this._geom_arrays.up_wires_faces[hole_wire_i] = face_i);
        new_tris_i.forEach( tri_i => this._geom_arrays.up_tris_faces[tri_i] = face_i );
        // delete the old trianges
        for (const old_face_tri_i of old_face_tris_i) {
            // remove these deleted tris from the verts
            for (const vertex_i of this._geom_arrays.dn_tris_verts[old_face_tri_i]) {
                this._remValFromSetInArr( this._geom_arrays.up_verts_tris, vertex_i, old_face_tri_i, true);
            }
            // tris to verts
            this._clearValsInArr(this._geom_arrays.dn_tris_verts, old_face_tri_i, false);
            // tris to faces
            this._clearValsInArr( this._geom_arrays.up_tris_faces, old_face_tri_i, false );
        }
        // return the numeric index of the face
        return face_i;
    }
    /**
     * Adds trangles and updates the arrays.
     * Wires are assumed to be closed!
     * This updates the trie->verts and the verts->tris
     * This does not update the face to which this wire belongs!
     * @param wire_i
     */
    private _createTris(wire_i: number, hole_wires_i?: number[]): number[] {
        // save all verts
        const all_verts_i: number[] = [];
        // get the coords of the outer perimeter edge
        const wire_verts_i: number[] = this.wireGetVerts(wire_i);
        const wire_xyzs: Txyz[] = [];
        for (const vert_i of wire_verts_i) {
            all_verts_i.push(vert_i);
            wire_xyzs.push( this.geom.model.attribs.query.getVertCoords(vert_i) );
        }
        // get the coords of the holes
        const all_hole_coords: Txyz[][] = [];
        if (hole_wires_i !== undefined) {
            for (const hole_wire_i of hole_wires_i) {
                const hole_verts_i: number[] = this.wireGetVerts(hole_wire_i);
                const hole_xyzs: Txyz[] = [];
                for (const vert_i of hole_verts_i) {
                    all_verts_i.push(vert_i);
                    hole_xyzs.push( this.geom.model.attribs.query.getVertCoords(vert_i) );
                }
                all_hole_coords.push(hole_xyzs);
            }
        }
        // create the triangles using earcut
        const tris_corners: number[][] = triangulate(wire_xyzs, all_hole_coords);
        const tris: TTri[] = tris_corners.map(tri_corners => tri_corners.map( corner => all_verts_i[corner] ) as TTri );
        // create the tris
        const tris_i: number[] = [];
        for (const tri of tris) {
            tris_i.push( this.addTriEnt(tri) );
        }
        // return an array of numeric indices of the triangles
        return tris_i;
    }
}

export interface GeomData extends
    GeomAdd, GeomColl, GeomEnt, GeomFace,
    GeomIns, GeomLink, GeomPack, GeomPosi,
    GeomRem, GeomRev, GeomTree, GeomVert,
    GeomWire, GeomMerge, GeomCheck {}

applyMixins(GeomData, [
    GeomAdd, GeomColl, GeomEnt, GeomFace,
    GeomIns, GeomLink, GeomPack, GeomPosi,
    GeomRem, GeomRev, GeomTree, GeomVert,
    GeomWire, GeomMerge, GeomCheck
]);

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            const attribs = Object.getOwnPropertyDescriptor(
                baseCtor.prototype, name) as PropertyDescriptor;
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                attribs
            );
        });
    });
}
