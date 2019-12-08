/**
 * The `collections` module has functions for creating and modifying collections.
 */

/**
 *
 */

import { SIModel } from '@assets/libs/sim/SIModel';
import { TId, EEntType, TEntTypeIdx, EFilterOperatorTypes } from '@libs/sim/common';
import { isPoint, isPline, isPgon, isColl, idsMake, getArrDepth, isEmptyArr } from '@libs/sim/id';
import { __merge__} from '../_model';
import { _model } from '..';
import { checkArgTypes, checkIDs, IDcheckObj, TypeCheckObj } from '../_check_args';
import { arrMakeFlat } from '@libs/util/arrs';

// ================================================================================================
/**
 * Adds one or more new collections to the model.
 * ~
 * If the list of entities contains other collections, these other collections will then become
 * children of the new collection that will be created.
 * ~
 * @param __model__
 * @param entities List or nested lists of points, polylines, polygons, and other colletions.
 * @param name The name to give to this collection, resulting in an attribute called `name`. If `null`, no attribute will be created.
 * @returns Entities, new collection, or a list of new collections.
 * @example collection1 = collection.Create([point1,polyine1,polygon1], 'my_coll')
 * @example_info Creates a collection containing point1, polyline1, polygon1, with an attribute `name = 'my_coll'`.
 * @example collections = collection.Create([[point1,polyine1],[polygon1]], ['coll1', 'coll2'])
 * @example_info Creates two collections, the first containing point1 and polyline1, the second containing polygon1.
 */
export function Create(__model__: SIModel, entities: TId|TId[]|TId[][], name: string|string[]): TId|TId[] {
    // --- Error Check ---
    const fn_name = 'collection.Create';
    const ents_arr = checkIDs(fn_name, 'entities', entities,
        [IDcheckObj.isID, IDcheckObj.isIDList, IDcheckObj.isIDList_list],
        [EEntType.POINT, EEntType.PLINE, EEntType.PGON, EEntType.COLL]) as TEntTypeIdx[];
    checkArgTypes(fn_name, 'name', name, [TypeCheckObj.isString, TypeCheckObj.isStringList]);
    // --- Error Check ---
    const new_ent_arrs: TEntTypeIdx|TEntTypeIdx[] = _create(__model__, ents_arr);
    // set the name
    if (name !== null) {
        let colls_i: number[] = [];
        if (Array.isArray(new_ent_arrs[0])) {
            colls_i = (new_ent_arrs as TEntTypeIdx[]).map( new_ent_arr => new_ent_arr[1] as number);
        } else {
            colls_i = [new_ent_arrs[1] as number];
        }
        if (Array.isArray(name)) {
            if (name.length !== colls_i.length) {
                throw new Error(fn_name +
                    ': The list of collection names must be equal in length to the list of collections that get created.');
            }
            for (let i = 0; i < name.length; i++) {
                __model__.attribs.add.setAttribVal(EEntType.COLL, colls_i[i], 'name', name[i]);
            }
        } else {
            __model__.attribs.add.setAttribVal(EEntType.COLL, colls_i, 'name', name);
        }
    }
    // return the collection id
    return idsMake(new_ent_arrs) as TId|TId[];
}
function _create(__model__: SIModel, ents_arr: TEntTypeIdx | TEntTypeIdx[] | TEntTypeIdx[][]): TEntTypeIdx | TEntTypeIdx[] {
    const depth: number = getArrDepth(ents_arr);
    if (depth === 1) {
        ents_arr = [ents_arr] as TEntTypeIdx[];
    } else if (depth === 3) {
        ents_arr = ents_arr as TEntTypeIdx[][];
        return ents_arr.map(ents_arr_item => _create(__model__, ents_arr_item)) as TEntTypeIdx[];
    }
    const points_i: number[] = [];
    const plines_i: number[] = [];
    const pgons_i: number[] = [];
    const child_colls_i: number[] = [];
    for (const ent_arr of ents_arr) {
        if (isPoint(ent_arr[0])) { points_i.push(ent_arr[1]); }
        if (isPline(ent_arr[0])) { plines_i.push(ent_arr[1]); }
        if (isPgon(ent_arr[0])) { pgons_i.push(ent_arr[1]); }
        if (isColl(ent_arr[0])) { child_colls_i.push(ent_arr[1]); }
    }
    // create the collection, setting tha parent to -1
    const coll_i: number = __model__.geom.add.addColl(-1, points_i, plines_i, pgons_i);
    // set the parents
    for (const child_coll_i of child_colls_i) {
        __model__.geom.data.collSetParent(child_coll_i, coll_i);
    }
    // return the new collection
    return [EEntType.COLL, coll_i];
}
// ================================================================================================
/**
 * Get a collection from the model, given the `name` attribute.
 * ~
 * @param __model__
 * @param names The name of the collection to get.
 * @returns The collection, or a list of collections.
 */
export function Get(__model__: SIModel, names: string|string[]): TId|TId[] {
    // --- Error Check ---
    const fn_name = 'collection.Get';
    checkArgTypes(fn_name, 'names', names, [TypeCheckObj.isString, TypeCheckObj.isStringList]);
    // --- Error Check ---
    const new_ent_arrs: TEntTypeIdx | TEntTypeIdx[] = _get(__model__, names);
    return idsMake(new_ent_arrs) as TId|TId[];
}
function _get(__model__: SIModel, names: string|string[]): TEntTypeIdx | TEntTypeIdx[] {
    if (!Array.isArray(names)) {
        const colls_i: number[] = __model__.geom.data.getEnts(EEntType.COLL, false);
        const query_result: number[] = __model__.attribs.query.filterByAttribs(
            EEntType.COLL, colls_i, 'name', null, EFilterOperatorTypes.IS_EQUAL, names);
        if (query_result.length > 0) {
            return [EEntType.COLL, query_result[0]];
        }
        return null;
    } else {
        return names.map(name => _get(__model__, name)) as TEntTypeIdx[];
    }
}
// ================================================================================================
/**
 * Addes entities to a collection.
 * ~
 * @param __model__
 * @param coll The collection to be updated.
 * @param entities Points, polylines, polygons, and collections to add.
 * @returns void
 */
export function Add(__model__: SIModel, coll: TId, entities: TId|TId[]): void {
    entities = arrMakeFlat(entities) as TId[];
    if (!isEmptyArr(entities)) {
        // --- Error Check ---
        const fn_name = 'collection.Add';
        const coll_arr = checkIDs(fn_name, 'coll', coll, [IDcheckObj.isID], [EEntType.COLL]) as TEntTypeIdx;
        const ents_arr: TEntTypeIdx[] = checkIDs(fn_name, 'entities', entities,
            [IDcheckObj.isID, IDcheckObj.isIDList],
            [EEntType.POINT, EEntType.PLINE, EEntType.PGON, EEntType.COLL]) as TEntTypeIdx[];
        // --- Error Check ---
        _collectionAdd(__model__, coll_arr[1], ents_arr);
    }
}

function _collectionAdd(__model__: SIModel, coll_i: number, ents_arr: TEntTypeIdx[]): void {
    for (const [ent_type, ent_i] of ents_arr) {
        switch (ent_type) {
            case EEntType.POINT:
                __model__.geom.data.collAddPoint(coll_i, ent_i);
                break;
            case EEntType.PLINE:
                __model__.geom.data.collAddPline(coll_i, ent_i);
                break;
            case EEntType.PGON:
                __model__.geom.data.collAddPgon(coll_i, ent_i);
                break;
            case EEntType.COLL:
                __model__.geom.data.collSetParent(ent_i, coll_i);
                break;
            default:
                throw new Error('Error adding entities to a collection. \
                A collection can only contain points, polylines, polygons, and other collections.');
        }
    }
}
// ================================================================================================
/**
 * Removes entities from a collection.
 * ~
 * @param __model__
 * @param coll The collection to be updated.
 * @param entities Points, polylines, polygons, and collections to add.
 * @returns void
 */
export function Remove(__model__: SIModel, coll: TId, entities: TId|TId[]): void {
    entities = arrMakeFlat(entities) as TId[];
    if (!isEmptyArr(entities)) {
        // --- Error Check ---
        const fn_name = 'collection.Remove';
        const coll_arr = checkIDs(fn_name, 'coll', coll, [IDcheckObj.isID], [EEntType.COLL]) as TEntTypeIdx;
        let ents_arr: TEntTypeIdx[] = null;
        if (entities !== null) {
            ents_arr = checkIDs(fn_name, 'entities', entities,
                [IDcheckObj.isID, IDcheckObj.isIDList],
                [EEntType.POINT, EEntType.PLINE, EEntType.PGON, EEntType.COLL]) as TEntTypeIdx[];
        }
        // --- Error Check ---
        if (ents_arr === null) {
            _collectionEmpty(__model__, coll_arr[1]);
        }
        _collectionRemove(__model__, coll_arr[1], ents_arr);
    }
}
function _collectionRemove(__model__: SIModel, coll_i: number, ents_arr: TEntTypeIdx[]): void {
    for (const [ent_type, ent_i] of ents_arr) {
        switch (ent_type) {
            case EEntType.POINT:
                __model__.geom.data.collRemovePoint(coll_i, ent_i);
                break;
            case EEntType.PLINE:
                __model__.geom.data.collRemovePline(coll_i, ent_i);
                break;
            case EEntType.PGON:
                __model__.geom.data.collRemovePgon(coll_i, ent_i);
                break;
            case EEntType.COLL:
                __model__.geom.data.collRemoveColl(coll_i, ent_i);
                break;
            default:
                throw new Error('Error removing entities from a collection. \
                A collection can only contain points, polylines, polygons, and other collections.');
        }
    }
}
function _collectionEmpty(__model__: SIModel, coll_i: number): void {
    const points_i: number[] = __model__.geom.data.navCollToPoint(coll_i);
    points_i.forEach(point_i => __model__.geom.data.collRemovePoint(coll_i, point_i));
    const plines_i: number[] = __model__.geom.data.navCollToPline(coll_i);
    plines_i.forEach(pline_i => __model__.geom.data.collRemovePline(coll_i, pline_i));
    const pgons_i: number[] = __model__.geom.data.navCollToPgon(coll_i);
    pgons_i.forEach(pgon_i => __model__.geom.data.collRemovePgon(coll_i, pgon_i));
    const child_colls_i: number[] = __model__.geom.data.collGetChildren(coll_i);
    child_colls_i.forEach(child_coll_i => __model__.geom.data.collRemoveColl(coll_i, child_coll_i));
}
// ================================================================================================
