import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Working with posis
 *
 */
export class GeomPosi extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    // ============================================================================
    // Posis
    // ============================================================================
    /**
     * Returns a list of indices for all posis that have no verts
     */
    public getUnusedPosis(include_deleted: boolean): number[] {
        // get posis indices array from up array: up_posis_verts
        const posis: number[][] = this._geom_arrays.up_posis_verts;
        const posis_i: number[] = [];
        if (include_deleted) {
            for (let i = 0; i < posis.length; i++ ) {
                const posi = posis[i];
                if (posi !== undefined) {
                    if (posi.length === 0) { posis_i.push(i); }
                } else {
                    posis_i.push(null);
                }
            }
        } else {
            for (let i = 0; i < posis.length; i++ ) {
                const posi = posis[i];
                if (posi !== undefined) {
                    if (posi.length === 0) { posis_i.push(i); }
                }
            }
        }
        return posis_i;
    }
}
