import { SIModel } from '../SIModel';
import { GeomAdd } from './GeomAdd';
import { GeomModify } from './GeomModify';
import { GeomThreejs } from './GeomThreejs';
import { GeomDel } from './GeomDel';
import { GeomData } from './data/GeomData';
import { GeomDelVert } from './GeomDelVert';
import { TEntTypeIdx } from '../common';

/**
 * Class for geometry.
 */
export class Geom {
    public model: SIModel;
    public selected: TEntTypeIdx[]; // entities that should become selected
    // low level data
    public data: GeomData;
    // high level classes
    public add: GeomAdd;
    public del: GeomDel;
    public del_vert: GeomDelVert;
    public modify: GeomModify;
    public threejs: GeomThreejs;
    /**
     * Constructor
     */
    constructor(model: SIModel) {
        this.model = model;
        // low level data
        this.data = new GeomData(this);
        // high level classes
        this.add = new GeomAdd(this);
        this.del = new GeomDel(this);
        this.del_vert = new GeomDelVert(this);
        this.modify = new GeomModify(this);
        this.threejs = new GeomThreejs(this);
        // selected entities
        this.selected = [];
    }
}
