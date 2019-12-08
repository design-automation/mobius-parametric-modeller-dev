import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';
import { TCollParent } from '../../common';

/**
 * Working with collections.
 */
export class GeomColl extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    // ============================================================================
    // Collections
    // No internal data passed by reference
    // ============================================================================

    /**
     * Add entities to a collection
     */
    public collAddPoint(coll_i: number, point_i: number): void {
        this._addValToSetInArr(this._geom_arrays.dn_colls_points, coll_i, point_i);
        this._addValToSetInArr(this._geom_arrays.up_points_colls, point_i, coll_i);
    }
    /**
     * Add entities to a collection
     */
    public collAddPline(coll_i: number, pline_i: number): void {
        this._addValToSetInArr(this._geom_arrays.dn_colls_plines, coll_i, pline_i);
        this._addValToSetInArr(this._geom_arrays.up_points_colls, pline_i, coll_i);
    }
    /**
     * Add entities to a collection
     */
    public collAddPgon(coll_i: number, pgon_i: number): void {
        this._addValToSetInArr(this._geom_arrays.dn_colls_pgons, coll_i, pgon_i);
        this._addValToSetInArr(this._geom_arrays.up_points_colls, pgon_i, coll_i);
    }
    /**
     * Add collection to a collection, the first collection is the parent, the second is the child
     */
    public collAddColl(coll0_i: number, coll1_i: number): void {
        this._geom_arrays.dn_colls_parents[coll1_i] = coll0_i;
    }
    /**
     * Remove entities from a collection.
     */
    public collRemovePoint(coll_i: number, point_i: number): void {
        if (this._geom_arrays.dn_colls_points[coll_i] == null) { return; } // deleted
        this._remValFromSetInArr(this._geom_arrays.dn_colls_points, coll_i, point_i, false);
        this._remValFromSetInArr(this._geom_arrays.up_points_colls, point_i, coll_i, true);
    }
    /**
     * Remove entities from a collection.
     */
    public collRemovePline(coll_i: number, pline_i: number): void {
        if (this._geom_arrays.dn_colls_plines[coll_i] == null) { return; } // deleted
        this._remValFromSetInArr(this._geom_arrays.dn_colls_plines, coll_i, pline_i, false);
        this._remValFromSetInArr(this._geom_arrays.up_plines_colls, pline_i, coll_i, true);
    }
    /**
     * Remove entities from a collection.
     */
    public collRemovePgon(coll_i: number, pgon_i: number): void {
        if (this._geom_arrays.dn_colls_pgons[coll_i] == null) { return; } // deleted
        this._remValFromSetInArr(this._geom_arrays.dn_colls_pgons, coll_i, pgon_i, false);
        this._remValFromSetInArr(this._geom_arrays.up_pgons_colls, pgon_i, coll_i, true);
    }
    /**
     * Remove entities from a collection.
     * Remove the second collection from the first collection.
     */
    public collRemoveColl(coll0_i: number, coll1_i: number): void {
        if (this._geom_arrays.dn_colls_parents[coll0_i] == null) { return; } // deleted
        if (this._geom_arrays.dn_colls_parents[coll1_i] === coll0_i) {
            this._geom_arrays.dn_colls_parents[coll1_i] = null;
        }
    }
    /**
     * Get the parent of a collection.
     * @param coll_i
     */
    public collGetParent(coll_i: number): number {
        return this._geom_arrays.dn_colls_parents[coll_i];
    }
    /**
     * Set the parent of a collection
     * @param coll_i The index of teh collection that is the parent
     * @param parent_coll_i
     */
    public collSetParent(coll_i: number, parent_coll_i: number): void {
        this._geom_arrays.dn_colls_parents[coll_i] = parent_coll_i;
    }
    /**
     * Clears the parent of a collection
     * @param coll_i The index of teh collection that is the parent
     */
    public collClearParent(coll_i: number): void {
        this._geom_arrays.dn_colls_parents[coll_i] = null;
    }
    /**
     * Get the ancestor collections of a collection.
     * @param coll_i
     */
    public collGetAncestors(coll_i: number): number[] {
        const ancestor_colls_i: number[] = [];
        let parent_coll_i: number = this._geom_arrays.dn_colls_parents[coll_i];
        while (parent_coll_i !== undefined && parent_coll_i !== null) {
            ancestor_colls_i.push(parent_coll_i);
            parent_coll_i = this._geom_arrays.dn_colls_parents[parent_coll_i];
        }
        return ancestor_colls_i;
    }
    /**
     * Returns true if the first coll is an ancestor of the second coll.
     * @param coll_i
     */
    public collIsAncestor(coll1_i: number, coll2_i: number): boolean {
        let parent_coll: TCollParent = this._geom_arrays.dn_colls_parents[coll2_i];
        while (parent_coll !== undefined && parent_coll !== null) {
            parent_coll = this._geom_arrays.dn_colls_parents[parent_coll];
            if (parent_coll === coll1_i) { return true; }
        }
        return false;
    }
}
