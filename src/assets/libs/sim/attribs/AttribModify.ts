import { EEntType, EEntTypeStr } from '../common';
import { GIAttribMap } from './data/AttribMap';
import { Attribs } from './Attribs';

/**
 * Class for attributes.
 */
export class AttribsModify {
    private _attribs: Attribs;
    /**
     * Constructor
     */
    constructor(attribs: Attribs) {
        this._attribs = attribs;
    }
    /**
     * Deletes an existing attribute.
     *
     * @param ent_type The level at which to create the attribute.
     * @param name The name of the attribute.
     * @return True if the attribute was created, false otherwise.
     */
    public delAttrib(ent_type: EEntType, name: string): boolean {
        const attribs_maps_key: string = EEntTypeStr[ent_type];
        const attribs: Map<string, GIAttribMap> = this._attribs._attribs_maps[attribs_maps_key];
        return attribs.delete(name);
    }
    /**
     * Rename an existing attribute.
     *
     * @param ent_type The level at which to create the attribute.
     * @param old_name The name of the old attribute.
     * @param new_name The name of the new attribute.
     * @return True if the attribute was renamed, false otherwise.
     */
    public renameAttrib(ent_type: EEntType, old_name: string, new_name: string): boolean {
        const attribs_maps_key: string = EEntTypeStr[ent_type];
        const attribs: Map<string, GIAttribMap> = this._attribs._attribs_maps[attribs_maps_key];
        if (!attribs.has(old_name)) { return false; }
        if (attribs.has(new_name)) { return false; }
        if (old_name === new_name) { return false; }
        const attrib: GIAttribMap = attribs.get(old_name);
        attrib.setName(new_name);
        const result = attribs.set(new_name, attrib);
        return attribs.delete(old_name);
    }
    // ============================================================================
    // Private methods
    // ============================================================================
}
