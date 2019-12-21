import { TAttribDataTypes, EEntType, IAttribsMaps, EEntTypeStr } from '../../common';
import { AttribMap } from './AttribMap';
import { AttribsBase } from './AttribsBase';
import { Attribs } from '../Attribs';

/**
 * Printing attribute data for debugging.
 */
export class AttribsPrint extends AttribsBase {
    /**
     * Constructor
     */
    constructor(attribs: Attribs, attribs_maps: IAttribsMaps) {
        super(attribs, attribs_maps);
    }
    /**
     * For debugging
     */
    public print(msg: string): void {
        function attribStr(attrib_map: Map<string, AttribMap>): string {
            let all_attribs_str = '[';
            for (const key of attrib_map.keys()) {
                all_attribs_str += '\n\t' + key + ': ' + JSON.stringify(attrib_map.get(key).getData()).replace(/,/g, ', ');
            }
            if (all_attribs_str.length === 1) {
                all_attribs_str += ']';
            } else {
                all_attribs_str += '\n]';
            }
            return all_attribs_str;
        }
        console.log(
            '\n------------------------------------------------------------ \n',
            '\n' + msg + '\n',
            '\nATTRIB DATA',
            '\n-----------',
            '\nposis: '  + attribStr(this.attribs_maps.ps),
            '\nverts: '  + attribStr(this.attribs_maps._v),
            '\nedges: '  + attribStr(this.attribs_maps._e),
            '\nwires: '  + attribStr(this.attribs_maps._w),
            '\nfaces: '  + attribStr(this.attribs_maps._f),
            '\npoints: ' + attribStr(this.attribs_maps.pt),
            '\nplines: ' + attribStr(this.attribs_maps.pl),
            '\npgons: '  + attribStr(this.attribs_maps.pg),
            '\ncolls: '  + attribStr(this.attribs_maps.co),
            '\nmodel: '  + JSON.stringify(Array.from(this.attribs_maps.mo)).replace(/,/g, ', ')
        );
    }
    // ============================================================================
    // Private methods
    // ============================================================================
}
