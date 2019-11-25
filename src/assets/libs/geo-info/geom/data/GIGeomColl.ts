import { IGeomArrays } from '../../common';
import { GIGeom } from '../GIGeom';
import { GIGeomNav } from './GIGeomNav';

/**
 * Working with collections.
 */
export class GIGeomColl extends GIGeomNav {
    /**
     * Constructor
     */
    constructor(geom: GIGeom, geom_arrays: IGeomArrays) {
        super(geom, geom_arrays);
    }
    // ============================================================================
    // Collections
    // No internal data passed by reference
    // ============================================================================

    /**
     * Add entities to a collection
     */
    public collAddPoint(coll_i: number, point_i: number): void {
        this._addToSet(this._geom_arrays.dn_colls_objs[coll_i], 1, point_i);
        this._addToSet(this._geom_arrays.up_points_colls, point_i, coll_i);
    }
    /**
     * Add entities to a collection
     */
    public collAddPline(coll_i: number, pline_i: number): void {
        this._addToSet(this._geom_arrays.dn_colls_objs[coll_i], 2, pline_i);
        this._addToSet(this._geom_arrays.up_points_colls, pline_i, coll_i);
    }
    /**
     * Add entities to a collection
     */
    public collAddPgon(coll_i: number, pgon_i: number): void {
        this._addToSet(this._geom_arrays.dn_colls_objs[coll_i], 3, pgon_i);
        this._addToSet(this._geom_arrays.up_points_colls, pgon_i, coll_i);
    }
    /**
     * Add collection to a collection, the first collection is the parent, the second is the child
     */
    public collAddColl(coll0_i: number, coll1_i: number): void {
        this._insToArr(this._geom_arrays.dn_colls_objs[coll1_i], 0, coll0_i, 0);
    }
    /**
     * Remove entities from a collection.
     */
    public collRemovePoint(coll_i: number, point_i: number): void {
        if (this._geom_arrays.dn_colls_objs[coll_i] == null) { return; } // deleted
        this._remFromSet(this._geom_arrays.dn_colls_objs[coll_i], 1, point_i, false);
        this._remFromSet(this._geom_arrays.up_points_colls, point_i, coll_i, true);
    }
    /**
     * Remove entities from a collection.
     */
    public collRemovePline(coll_i: number, pline_i: number): void {
        if (this._geom_arrays.dn_colls_objs[coll_i] == null) { return; } // deleted
        this._remFromSet(this._geom_arrays.dn_colls_objs[coll_i], 2, pline_i, false);
        this._remFromSet(this._geom_arrays.up_plines_colls, pline_i, coll_i, true);
    }
    /**
     * Remove entities from a collection.
     */
    public collRemovePgon(coll_i: number, pgon_i: number): void {
        if (this._geom_arrays.dn_colls_objs[coll_i] == null) { return; } // deleted
        this._remFromSet(this._geom_arrays.dn_colls_objs[coll_i], 3, pgon_i, false);
        this._remFromSet(this._geom_arrays.up_pgons_colls, pgon_i, coll_i, true);
    }
    /**
     * Remove entities from a collection.
     * Remove the second collection from the first collection.
     */
    public collRemoveColl(coll0_i: number, coll1_i: number): void {
        if (this._geom_arrays.dn_colls_objs[coll0_i] == null) { return; } // deleted
        if (this._geom_arrays.dn_colls_objs[coll1_i][0][0] === coll0_i) {
            this._geom_arrays.dn_colls_objs[coll1_i][0] = [];
        }
    }
    /**
     * Get the parent of a collection.
     * @param coll_i
     */
    public collGetParent(coll_i: number): number {
        return this._geom_arrays.dn_colls_objs[coll_i][0][0];
    }
    /**
     * Set the parent of a collection
     * @param coll_i The index of teh collection that is the parent
     * @param parent_coll_i
     */
    public collSetParent(coll_i: number, parent_coll_i: number): void {
        this._geom_arrays.dn_colls_objs[coll_i][0][0] = parent_coll_i;
    }
    /**
     * Get the ancestor collections of a collection.
     * @param coll_i
     */
    public collGetAncestors(coll_i: number): number[] {
        const ancestor_colls_i: number[] = [];
        let parent_coll_i: number = this._geom_arrays.dn_colls_objs[coll_i][0][0];
        while (parent_coll_i !== undefined) {
            ancestor_colls_i.push(parent_coll_i);
            parent_coll_i = this._geom_arrays.dn_colls_objs[parent_coll_i][0][0];
        }
        return ancestor_colls_i;
    }
    /**
     * Returns true if the first coll is an ancestor of the second coll.
     * @param coll_i
     */
    public collIsAncestor(coll1_i: number, coll2_i: number): boolean {
        let parent_coll_i: number = this._geom_arrays.dn_colls_objs[coll2_i][0][0];
        while (parent_coll_i !== undefined) {
            parent_coll_i = this._geom_arrays.dn_colls_objs[parent_coll_i][0][0];
            if (parent_coll_i === coll1_i) { return true; }
        }
        return false;
    }
}
