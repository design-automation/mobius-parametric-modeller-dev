import { GIModel } from '../GIModel';
import { IGeomArrays, TEntTypeIdx } from '../common';
import { GIGeomAdd } from './GIGeomAdd';
import { GIGeomModify } from './GIGeomModify';
import { GIGeomThreejs } from './GIGeomThreejs';
import { GIGeomIO } from './GIGeomIO';
import { GIGeomDel } from './GIGeomDel';
import { GIGeomCheck } from './data/GIGeomCheck';
import { GIGeomCompare } from './GIGeomCompare';
import { GIGeomData } from './data/GIGeomData';
import { GIGeomDelVert } from './GIGeomDelVert';

/**
 * Class for geometry.
 */
export class GIGeom {
    public model: GIModel;
    public selected: TEntTypeIdx[]; // entities that should become selected
    //  all arrays
    public _geom_arrays: IGeomArrays = {  // TODO this should not be public
        // num_posis: 0,
        dn_verts_posis: [],
        dn_tris_verts: [],
        dn_edges_verts: [],
        dn_wires_edges: [],
        dn_faces_wirestris: [],
        dn_points_verts: [],
        dn_plines_wires: [],
        dn_pgons_faces: [],
        dn_colls_objs: [],
        up_posis_verts: [],
        up_tris_faces: [],
        up_verts_edges: [],
        up_verts_tris: [],
        up_verts_points: [],
        up_edges_wires: [],
        up_wires_faces: [],
        up_wires_plines: [],
        up_faces_pgons: [],
        up_points_colls: [],
        up_plines_colls: [],
        up_pgons_colls: []
    };
    // daga with low level methods
    public data: GIGeomData;
    // classes with user methods
    public io: GIGeomIO;
    public add: GIGeomAdd;
    public del: GIGeomDel;
    public del_vert: GIGeomDelVert;
    public modify: GIGeomModify;
    public checker: GIGeomCheck;
    public comparator: GIGeomCompare;
    public threejs: GIGeomThreejs;
    /**
     * Constructor
     */
    constructor(model: GIModel) {
        this.model = model;
        this.data = new GIGeomData(this, this._geom_arrays);
        this.io = new GIGeomIO(this, this._geom_arrays, this.data);
        this.add = new GIGeomAdd(this);
        this.del = new GIGeomDel(this);
        this.del_vert = new GIGeomDelVert(this);
        this.modify = new GIGeomModify(this);
        this.checker = new GIGeomCheck(this, this._geom_arrays, this.data);
        this.comparator = new GIGeomCompare(this, this._geom_arrays, this.data);
        this.threejs = new GIGeomThreejs(this, this._geom_arrays, this.data);
        this.selected = [];
    }
}
