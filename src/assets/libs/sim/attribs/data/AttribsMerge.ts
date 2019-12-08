import { TAttribDataTypes, EEntType, IAttribsMaps, EEntTypeStr } from '../../common';
import { GIAttribMap } from './AttribMap';
import { AttribsBase } from './AttribsBase';
import { Attribs } from '../Attribs';

/**
 * Class for attributes.
 */
export class AttribsMerge extends AttribsBase {
    /**
     * Constructor
     */
    constructor(attribs: Attribs, attribs_maps: IAttribsMaps) {
        super(attribs, attribs_maps);
    }
    /**
     * Adds data to this model from JSON data.
     * The existing data in the model is not deleted.
     * @param model_data The JSON data for the model.
     */
    public merge(attribs: Attribs): void {
        const attribs_maps: IAttribsMaps = attribs._attribs_maps; // TODO
        // add the attribute data
        if (attribs_maps.ps !== undefined) { this._mergeAttribs(attribs_maps, EEntType.POSI); }
        if (attribs_maps._v !== undefined) { this._mergeAttribs(attribs_maps, EEntType.VERT); }
        if (attribs_maps._e !== undefined) { this._mergeAttribs(attribs_maps, EEntType.EDGE); }
        if (attribs_maps._w !== undefined) { this._mergeAttribs(attribs_maps, EEntType.WIRE); }
        if (attribs_maps._f !== undefined) { this._mergeAttribs(attribs_maps, EEntType.FACE); }
        if (attribs_maps.pt !== undefined) { this._mergeAttribs(attribs_maps, EEntType.POINT); }
        if (attribs_maps.pl !== undefined) { this._mergeAttribs(attribs_maps, EEntType.PLINE); }
        if (attribs_maps.pg !== undefined) { this._mergeAttribs(attribs_maps, EEntType.PGON); }
        if (attribs_maps.co !== undefined) { this._mergeAttribs(attribs_maps, EEntType.COLL); }
        if (attribs_maps.mo !== undefined) { this._mergeModelAttribs(attribs_maps); }
    }
    // ============================================================================
    // Private methods
    // ============================================================================
    /**
     * From another model
     * The existing attributes are not deleted
     * @param attribs_maps
     */
    private _mergeModelAttribs(attribs_maps: IAttribsMaps) {
        const from_attrib: Map<string, TAttribDataTypes> = attribs_maps[EEntTypeStr[ EEntType.MOD ]];
        const to_attrib: Map<string, TAttribDataTypes> = this.attribs_maps[EEntTypeStr[ EEntType.MOD ]];
        from_attrib.forEach( (value, name) => {
            to_attrib.set(name, value);
        });
    }
    /**
     * From another model
     * The existing attributes are not deleted
     * @param attribs_maps
     */
    private _mergeAttribs(attribs_maps: IAttribsMaps, ent_type: EEntType) {
        const from_attribs: Map<string, GIAttribMap> = attribs_maps[EEntTypeStr[ ent_type ]];
        const to_attribs: Map<string, GIAttribMap> = this.attribs_maps[EEntTypeStr[ ent_type ]];
        const num_ents: number = this.attribs.model.geom.data.numEnts(ent_type, true); // incude deleted ents
        from_attribs.forEach( from_attrib => {
            const name: string = from_attrib.getName();
            // get or create the existing attrib
            if (!to_attribs.has(name)) {
                to_attribs.set(name, new GIAttribMap( name, from_attrib.getDataType()) );
            }
            const to_attrib: GIAttribMap = to_attribs.get(name);
            // get the data and shift the ents_i indices
            const ents_i_values: [number[], TAttribDataTypes][] = from_attrib.getEntsVals();

            for (const ents_i_value of ents_i_values) {
                ents_i_value[0] = ents_i_value[0].map( ent_i => ent_i + num_ents ); // shift
            }
            // set the data
            to_attrib.setEntsVals(ents_i_values);
        });
    }
}
