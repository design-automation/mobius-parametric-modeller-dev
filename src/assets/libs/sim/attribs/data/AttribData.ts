import { IAttribsMaps } from '../../common';
import { AttribsGetSet } from './AttribGetSet';
import { Attribs } from '../Attribs';

/**
 * Class for attributes.
 */
export class AttribsData extends AttribsGetSet {
    /**
     * Constructor
     */
    constructor(attribs: Attribs, attribs_maps: IAttribsMaps) {
        super(attribs, attribs_maps);
    }
}
