import { Attribs } from '../Attribs';
import { IAttribsMaps } from '../../common';

export class AttribsBase {
    protected attribs: Attribs;
    protected attribs_maps: IAttribsMaps;
    /**
     * Constructor
     */
    constructor(attribs: Attribs, attribs_maps: IAttribsMaps) {
        this.attribs = attribs;
        this.attribs_maps = attribs_maps;
    }
}
