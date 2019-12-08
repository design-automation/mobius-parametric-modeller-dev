import { SIModel } from '../SIModel';
import { IGeomArrays, TEntTypeIdx } from '../common';
import { GeomAdd } from './GeomAdd';
import { GeomModify } from './GeomModify';
import { GeomThreejs } from './GeomThreejs';
import { GeomIO } from './GeomIO';
import { GeomDel } from './GeomDel';
import { GeomCheck } from './data/GeomCheck';
import { GeomCompare } from './GeomCompare';
import { GeomData } from './data/GeomData';
import { GeomDelVert } from './GeomDelVert';

/**
 * Class for geometry.
 */
export class Geom {
    public model: SIModel;
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
    public data: GeomData;
    // classes with user methods
    public io: GeomIO;
    public add: GeomAdd;
    public del: GeomDel;
    public del_vert: GeomDelVert;
    public modify: GeomModify;
    public checker: GeomCheck;
    public comparator: GeomCompare;
    public threejs: GeomThreejs;
    /**
     * Constructor
     */
    constructor(model: SIModel) {
        this.model = model;
        this.data = new GeomData(this, this._geom_arrays);
        this.io = new GeomIO(this, this._geom_arrays, this.data);
        this.add = new GeomAdd(this);
        this.del = new GeomDel(this);
        this.del_vert = new GeomDelVert(this);
        this.modify = new GeomModify(this);
        this.checker = new GeomCheck(this, this._geom_arrays, this.data);
        this.comparator = new GeomCompare(this, this._geom_arrays, this.data);
        this.threejs = new GeomThreejs(this, this._geom_arrays, this.data);
        this.selected = [];
    }
}
