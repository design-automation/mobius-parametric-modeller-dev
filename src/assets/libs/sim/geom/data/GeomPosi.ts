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
    /**
     * Returns a list of indices for all posis that have no verts
     */
    public getAllUnusedPosis(): number[] {
        const posis: number[][] = this._geom_arrays.up_posis_verts;
        const posis_i: number[] = [];
        for (let i = 0; i < posis.length; i++ ) {
            const posi = posis[i];
            if (posi !== undefined && posi.length === 0) {
                posis_i.push(i);
            }
        }
        return posis_i;
    }
    /**
     * Filter a list of posis, and return those posis that have no verts
     */
    public getUnusedPosis(posis_i: number[]): number[] {
        const unused_posis_i: number[] = [];
        for (const posi_i of posis_i) {
            const posi = this._geom_arrays.up_posis_verts[posi_i];
            if (posi !== undefined && posi.length === 0) {
                unused_posis_i.push(posi_i);
            }
        }
        return unused_posis_i;
    }
}
