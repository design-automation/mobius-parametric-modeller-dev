import { EEntType, IGeomArrays, EEntStrToGeomArray } from '../../common';
import { GIGeom } from '../Geom';
import { GIGeomNav } from './GeomNav';

/**
 * Working with entities.
 *
 */
export class GIGeomEnt extends GIGeomNav {
    /**
     * Constructor
     */
    constructor(geom: GIGeom, geom_arrays: IGeomArrays) {
        super(geom, geom_arrays);
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
        // get posis indices array from up array: up_posis_verts
        if (ent_type === EEntType.POSI) {
            const posis: number[][] = this._geom_arrays.up_posis_verts;
            const posis_i: number[] = [];
            if (include_deleted) {
                let i = 0; const i_max = posis.length;
                for (; i < i_max; i++ ) {
                    const posi = posis[i];
                    if (posi !== null) {
                        posis_i.push(i);
                    } else {
                        posis_i.push(null); // TODO
                    }
                }
            } else {
                let i = 0; const i_max = posis.length;
                for (; i < i_max; i++ ) {
                    const posi = posis[i];
                    if (posi !== null) {
                        posis_i.push(i);
                    }
                }
            }
            return posis_i;
        }
        // get ents indices array from down arrays
        const geom_array_key: string = EEntStrToGeomArray[ent_type];
        const geom_array: any[] = this._geom_arrays[geom_array_key];
        const ents_i: number[] = [];
        if (include_deleted) {
            let i = 0; const i_max = geom_array.length;
            for (; i < i_max; i++ ) {
                const ent = geom_array[i];
                if (ent !== null) {
                    ents_i.push(i);
                } else {
                    ents_i.push(null); // TODO
                }
            }
        } else {
            let i = 0; const i_max = geom_array.length;
            for (; i < i_max; i++ ) {
                const ent = geom_array[i];
                if (ent !== null) {
                    ents_i.push(i);
                }
            }
        }
        return ents_i;
    }
    /**
     * Returns the number of entities
     */
    public numEnts(ent_type: EEntType, include_deleted: boolean): number {
        return this.getEnts(ent_type, include_deleted).length;
    }

    /**
     * Check if an entity exists
     * @param ent_type
     * @param index
     */
    public entExists(ent_type: EEntType, index: number): boolean {
        if (ent_type === EEntType.POSI) {
            return (
                this._geom_arrays.up_posis_verts[index] !== undefined &&
                this._geom_arrays.up_posis_verts[index] !== null
            );
        }
        const geom_arrays_key: string = EEntStrToGeomArray[ent_type];
        return (
            this._geom_arrays[geom_arrays_key][index] !== undefined &&
            this._geom_arrays[geom_arrays_key][index] !== null
        );
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

            // ============================================================================
    // Get num ents
    //
    // ============================================================================
    public numEnts2(ent_type: number): number {
        switch (ent_type) {
            case EEntType.POSI:
                return this.numPosis();
            case EEntType.VERT:
                return this.numVerts();
            case EEntType.EDGE:
                return this.numEdges();
            case EEntType.WIRE:
                return this.numWires();
            case EEntType.FACE:
                return this.numFaces();
            case EEntType.POINT:
                return this.numPoints();
            case EEntType.PLINE:
                return this.numPlines();
            case EEntType.PGON:
                return this.numPgons();
            case EEntType.COLL:
                return this.numColls();
        }
    }
    public numPosis(): number {
        return this._geom_arrays.up_posis_verts.length;
    }
    public numVerts(): number {
        return this._geom_arrays.dn_verts_posis.length;
    }
    public numEdges(): number {
        return this._geom_arrays.dn_verts_posis.length;
    }
    public numWires(): number {
        return this._geom_arrays.dn_verts_posis.length;
    }
    public numTris(): number {
        return this._geom_arrays.dn_verts_posis.length;
    }
    public numFaces(): number {
        return this._geom_arrays.dn_verts_posis.length;
    }
    public numPoints(): number {
        return this._geom_arrays.dn_verts_posis.length;
    }
    public numPlines(): number {
        return this._geom_arrays.dn_verts_posis.length;
    }
    public numPgons(): number {
        return this._geom_arrays.dn_verts_posis.length;
    }
    public numColls(): number {
        return this._geom_arrays.dn_verts_posis.length;
    }
}
