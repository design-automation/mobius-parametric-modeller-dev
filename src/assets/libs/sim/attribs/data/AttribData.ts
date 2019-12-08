import { IAttribsData, IAttribsMaps, TModelAttribValuesArr, EEntTypeStr, EEntType, IAttribData } from '../../common';
import { GIAttribMap } from './AttribMap';
import { AttribsMerge } from './AttribsMerge';
import { Attribs } from '../Attribs';

/**
 * Class for attributes.
 */
export class AttribsData extends AttribsMerge {
    /**
     * Constructor
     */
    constructor(attribs: Attribs, attribs_maps: IAttribsMaps) {
        super(attribs, attribs_maps);
    }
    /**
     * Returns the JSON data for this model.
     */
    public getData(): IAttribsData {
        return {
            posis: Array.from(this.attribs_maps.ps.values()).map(attrib => attrib.getData()),
            verts: Array.from(this.attribs_maps._v.values()).map(attrib => attrib.getData()),
            edges: Array.from(this.attribs_maps._e.values()).map(attrib => attrib.getData()),
            wires: Array.from(this.attribs_maps._w.values()).map(attrib => attrib.getData()),
            faces: Array.from(this.attribs_maps._f.values()).map(attrib => attrib.getData()),
            points: Array.from(this.attribs_maps.pt.values()).map(attrib => attrib.getData()),
            plines: Array.from(this.attribs_maps.pl.values()).map(attrib => attrib.getData()),
            pgons: Array.from(this.attribs_maps.pg.values()).map(attrib => attrib.getData()),
            colls: Array.from(this.attribs_maps.co.values()).map(attrib => attrib.getData()),
            model: Array.from(this.attribs_maps.mo)
        };
    }
    /**
     * Adds data to this model from JSON data.
     * The existing data in the model is deleted.
     * @param model_data The JSON data for the model.
     */
    public setData(attribs_data: IAttribsData): void {
        // add the attribute data
        if (attribs_data.posis !== undefined) {
            this._setAttribs(attribs_data.posis, EEntType.POSI);
        }
        if (attribs_data.verts !== undefined) {
            this._setAttribs(attribs_data.verts, EEntType.VERT);
        }
        if (attribs_data.edges !== undefined) {
            this._setAttribs(attribs_data.edges, EEntType.EDGE);
        }
        if (attribs_data.wires !== undefined) {
            this._setAttribs(attribs_data.wires, EEntType.WIRE);
        }
        if (attribs_data.faces !== undefined) {
            this._setAttribs(attribs_data.faces, EEntType.FACE);
        }
        if (attribs_data.points !== undefined) {
            this._setAttribs(attribs_data.points, EEntType.POINT);
        }
        if (attribs_data.plines !== undefined) {
            this._setAttribs(attribs_data.plines, EEntType.PLINE);
        }
        if (attribs_data.pgons !== undefined) {
            this._setAttribs(attribs_data.pgons, EEntType.PGON);
        }
        if (attribs_data.colls !== undefined) {
            this._setAttribs(attribs_data.colls, EEntType.COLL);
        }
        if (attribs_data.model !== undefined) {
            this._setModelAttribs(attribs_data.model);
        }
    }
    /**
     * From JSON data
     * Existing attributes are deleted
     * @param new_attribs_data
     */
    private _setModelAttribs(new_attribs_data: TModelAttribValuesArr) {
        this.attribs_maps[EEntTypeStr[ EEntType.MOD ]] = new Map(new_attribs_data);
    }
    /**
     * From JSON data
     * Existing attributes are deleted
     * @param new_attribs_data
     */
    private _setAttribs(new_attribs_data: IAttribData[], ent_type: EEntType) {
        const to_attribs: Map<string, GIAttribMap> = new Map();
        new_attribs_data.forEach( new_attrib_data => {
            const name: string = new_attrib_data.name;
            // create a new attrib
            const to_attrib: GIAttribMap = new GIAttribMap( name, new_attrib_data.data_type );
            to_attribs.set(name, to_attrib);
            // set the data
            to_attrib.setEntsVals(new_attrib_data.data);
        });
        this.attribs_maps[EEntTypeStr[ ent_type ]] = to_attribs;
    }
}
