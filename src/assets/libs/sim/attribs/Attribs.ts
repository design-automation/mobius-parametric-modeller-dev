import { AttribsAdd } from './AttribsAdd';
import { AttribsThreejs } from './AttribsThreejs';
import { AttribsQuery } from './AttribsQuery';
import { SIModel } from '../SIModel';
import { EEntType, EAttribNames, EAttribDataTypeStrs, IAttribsMaps } from '../common';
import { AttribsModify } from './AttribModify';
import { AttribsData } from './data/AttribData';

function hashCode(s: string) {
    let h: number;
    for (let i = 0; i < s.length; i++) {
          // tslint:disable-next-line:no-bitwise
          h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h;
}

/**
 * Class for attributes.
 */
export class Attribs {
    public model: SIModel;
    // maps, the key is the name, the value is the attrib map clas
    public _attribs_maps: IAttribsMaps = { // TODO this should not be public
        ps: new Map(),
        _v: new Map(),
        _e: new Map(),
        _w: new Map(),
        _f: new Map(),
        pt: new Map(),
        pl: new Map(),
        pg: new Map(),
        co: new Map(),
        mo: new Map()
    };
    // low level data
    public data: AttribsData;
    // high level classes
    public add: AttribsAdd;
    public modify: AttribsModify;
    public query: AttribsQuery;
    public threejs: AttribsThreejs;
   /**
     * Creates an object to store the attribute data.
     * @param model The JSON data
     */
    constructor(model: SIModel) {
        this.model = model;
        // low level data
        this.data = new AttribsData(this, this._attribs_maps);
        // high level classes
        this.add = new AttribsAdd(this);
        this.modify = new AttribsModify(this);
        this.query = new AttribsQuery(this);
        this.threejs = new AttribsThreejs(this);
        // add an attrib for xyz
        this.add.addAttrib(EEntType.POSI, EAttribNames.COORDS, EAttribDataTypeStrs.LIST);
    }
}
