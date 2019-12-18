import { TAttribDataTypes, EEntType, EAttribNames, Txy, TColor, Txyz, ITjsAttribData } from '../common';
import { GIAttribMap } from './data/AttribMap';
import { Attribs } from './Attribs';
import __ from 'underscore';

/**
 * Class for attributes.
 */
export class AttribsThreejs {
    private _attribs: Attribs;
    /**
     * Constructor
     */
    constructor(attribs: Attribs) {
        this._attribs = attribs;
    }
    /**
     * Get a flat array of all the coordinates of all the vertices.
     * Verts that have been deleted will not be included
     * Returns 6 arrays
     * 1) the flattened xyz value of all positions in the model
     * 2) the flattened colors values of all positions in the model (must be same len as 1)
     * 3) the flattened normals values of all positions in the model (must be same len as 1)
     * 2) posis_idx_to_i
     * 3) verts_idx_to_i
     * 4) verts_i_to_idx
     */
    public getTjsSeqAttribData(): ITjsAttribData {
        // coords
        const coords_attrib: GIAttribMap = this._attribs._attribs_maps.ps.get(EAttribNames.COORDS);
        const [coords, posis_idx_to_i, posis_i_to_idx]: [TAttribDataTypes[], number[], number[]] = coords_attrib.getAllValsWithIdxs();
        // check
        const colors_attrib: GIAttribMap = this._attribs._attribs_maps._v.get(EAttribNames.COLOR);
        const normals_attrib: GIAttribMap = this._attribs._attribs_maps._v.get(EAttribNames.NORMAL);
        // colors and normals  arrays be the same length as coords
        const colors: TColor[] = new Array(coords.length);
        const normals: Txyz[] = normals_attrib === undefined ? null : new Array(coords.length);
        // verts
        const verts_idx_to_i: number[] = [];
        const verts_i_to_idx: number[] = [];
        const verts_i: number[] = this._attribs.model.geom.data.getEnts(EEntType.VERT);
        for (const vert_i of verts_i) {
            const posi_i: number = this._attribs.model.geom.data.navVertToPosi(vert_i);
            verts_i_to_idx[vert_i] = posis_i_to_idx[posi_i];
            verts_idx_to_i[posis_i_to_idx[posi_i]] = vert_i;
            if (colors_attrib !== undefined) {
                const col: TColor = colors_attrib.getEntVal(vert_i) as TColor;
                colors[posis_i_to_idx[posi_i]] = col === undefined ? [1, 1, 1] : col;
            } else {
                colors[posis_i_to_idx[posi_i]] = [1, 1, 1];
            }
            if (normals_attrib !== undefined) {
                const nor: Txyz = normals_attrib.getEntVal(vert_i) as Txyz;
                normals[posis_i_to_idx[posi_i]] =  nor === undefined ? [0, 0, 1] : nor;
            }
        }
        // return all the arrays
        return {
            coords_flat: __.flatten(coords, true),
            colors_flat: __.flatten(colors, true),
            normals_flat: normals_attrib === undefined ? null : __.flatten(normals, true),
            posis_idx_to_i: posis_idx_to_i,
            verts_idx_to_i: verts_idx_to_i,
            verts_i_to_idx: verts_i_to_idx
        };
    }
}
