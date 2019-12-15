import { EEntType, IGeomArrays, EEntStrToGeomArray } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Working with entities.
 *
 */
export class GeomEnt extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    // ============================================================================
    // Entities
    // ============================================================================
    /**
     * Returns a list of indices for all.
     *
     * No internal data passed by reference.
     *
     * If include_deleted=true, it will include ents that are null.
     */
    public getEnts(ent_type: EEntType, include_deleted: boolean): number[] {
        // get the array
        const geom_array_key: string = EEntStrToGeomArray[ent_type];
        const geom_array: any[] = this._geom_arrays[geom_array_key];
        if (include_deleted) {
            const ents_i: number[] = new Array(geom_array.length); // Preallocate array to correct length
            for (let i = 0; i < geom_array.length; i++ ) {
                const ent = geom_array[i];
                if (ent !== undefined) {
                    ents_i.push(i);
                } 
                // else {
                //     ents_i.push(null); // Deleted TODO
                // }
            }
            return ents_i;
        } else {
            const ents_i: number[] = [];
            for (let i = 0; i < geom_array.length; i++ ) {
                const ent = geom_array[i];
                if (ent !== undefined) {
                    ents_i.push(i);
                }
            }
            return ents_i;
        }
    }
    /**
     * Returns the number of entities
     */
    public numEnts(ent_type: EEntType, include_deleted: boolean): number {
        if (include_deleted) {
            const geom_array_key: string = EEntStrToGeomArray[ent_type];
            return this._geom_arrays[geom_array_key].length;
        } else {
            return this.getEnts(ent_type, include_deleted).length;
        }
    }
    /**
     * Check if an entity exists
     * @param ent_type
     * @param index
     */
    public entExists(ent_type: EEntType, index: number): boolean {
        const geom_arrays_key: string = EEntStrToGeomArray[ent_type];
        return this._geom_arrays[geom_arrays_key][index] !== undefined;
    }
   /**
     * Given a set of vertices, get the welded neighbour entities.
     * @param ent_type
     * @param verts_i
     */
    public getEntNeighbors(ent_type: EEntType, verts_i: number[]): number[] {
        const neighbour_ents_i: Set<number> = new Set();
        for (const vert_i of verts_i) {
            const posi_i: number = this.navVertToPosi(vert_i);
            const found_verts_i: number[] = this.navPosiToVert(posi_i);
            for (const found_vert_i of found_verts_i) {
                if (verts_i.indexOf(found_vert_i) === -1) {
                    const found_ents_i: number[] = this.navAnyToAny(EEntType.VERT, ent_type, found_vert_i);
                    found_ents_i.forEach( found_ent_i => neighbour_ents_i.add(found_ent_i) );
                }
            }
        }
        return Array.from(neighbour_ents_i);
    }
    /**
     * Given a set of edges, get the perimeter entities.
     * @param ent_type
     * @param edges_i
     */
    public getEntPerimeters(ent_type: EEntType, edges_i: number[]): number[] {
        const edge_posis_map: Map<number, number[]> = new Map();
        const edge_to_posi_pairs_map: Map<number, [number, number]> = new Map();
        for (const edge_i of edges_i) {
            const posi_pair_i: [number, number] = this.navAnyToPosi(EEntType.EDGE, edge_i) as [number, number];
            if (!edge_posis_map.has(posi_pair_i[0])) {
                edge_posis_map.set(posi_pair_i[0], []);
            }
            edge_posis_map.get(posi_pair_i[0]).push(posi_pair_i[1]);
            edge_to_posi_pairs_map.set(edge_i, posi_pair_i );
        }
        const perimeter_ents_i: Set<number> = new Set();
        for (const edge_i of edges_i) {
            const posi_pair_i: [number, number] = edge_to_posi_pairs_map.get(edge_i);
            if (!edge_posis_map.has(posi_pair_i[1]) || edge_posis_map.get(posi_pair_i[1]).indexOf(posi_pair_i[0]) === -1) {
                const found_ents_i: number[] = this.navAnyToAny(EEntType.EDGE, ent_type, edge_i);
                found_ents_i.forEach( found_ent_i => perimeter_ents_i.add(found_ent_i) );
            }
        }
        return Array.from(perimeter_ents_i);
    }
}
