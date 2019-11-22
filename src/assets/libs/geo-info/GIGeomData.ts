
import {  EEntType, IGeomArrays, TVert, TEdge, TWire, TFace, TPoint, TPline, TPgon, TColl,
    TPointTree, TPlineTree, TEdgeTree, TVertTree, TWireTree, TFaceTree, TPgonTree, TCollTree,
    IEntPack, EEntStrToGeomArray, TEntTypeIdx, IGeomPack, Txyz, TTri, TTree, EEntTypeStr } from './common';
import { isPosi, isVert, isPoint, isEdge, isWire, isPline, isFace, isPgon, isColl, isTri } from './id';
import { GIGeom } from './GIGeom';
import { triangulate } from '../triangulate/triangulate';

/**
 * Class for interacting with the core data.
 *
 * The data conssists of a set of sparse arrays.
 *
 * Posis are stored in the up_posis_verts array.
 * The up_posis_verts array must contain an entry for each posi that is not deleted.
 * If there are no vertices using the a posi, then the posi must have a [] value.
 *
 * Vertices are stored in the dn_verts_posis array.
 * For vertices, they must always have an array of length 2.
 * Each vertex has an in-edge and an out edge.
 * For a vertex at the start of a open wire, the array will be [null, start_posi_i].
 * For a vertex at the end of a open wire, the array will be [end_posi_i, null].
 *
 * Edges are stored in the dn_edges_verts array.
 * For edges, they must always have an array of length 2 since every edge must have.
 * exactly two vertices.
 *
 * Triangles are stored in the dn_tris_verts array.
 * Note that triangles are mostly hoddent from the user.
 *
 */
export class GIGeomData {
    private geom: GIGeom;
    private _geom_arrays: IGeomArrays;
    /**
     * Constructor
     */
    constructor(geom: GIGeom, geom_arrays: IGeomArrays) {
        this.geom = geom;
        this._geom_arrays = geom_arrays;
    }
    // ============================================================================
    // Utility methods
    // ============================================================================
    // single value
    private _set(arr: any[], arr_idxs: number|number[], item: number): void {
        if (!Array.isArray(arr_idxs)) {
            arr[arr_idxs] = item;
        } else {
            arr_idxs.forEach( arr_idx => this._set(arr, arr_idx, item) );
        }
    }
    private _clear(arr: any[], arr_idxs: number|number[], del: boolean): void {
        if (!Array.isArray(arr_idxs)) {
            if (del) {
                delete arr[arr_idxs];
            } else {
                arr[arr_idxs] = null;
            }
        } else {
            arr_idxs.forEach( arr_idx => this._clear(arr, arr_idx, del) );
        }
    }
    private _clearIf(arr: any[], arr_idxs: number|number[], val: number, del: boolean): void {
        if (!Array.isArray(arr_idxs)) {
            if (arr[arr_idxs] === val) {
                if (del) {
                    delete arr[arr_idxs];
                } else {
                    arr[arr_idxs] = null;
                }
            }
        } else {
            arr_idxs.forEach( arr_idx => this._clear(arr, arr_idx, del) );
        }
    }
    // set of unique values, stored as arrays
    private _addToSet(arr: any[], arr_idxs: number|number[], item: number): void {
        if (item === undefined) { return; }
        if (!Array.isArray(arr_idxs)) {
            if (!arr[arr_idxs]) { arr[arr_idxs] = []; }
            if (arr[arr_idxs].indexOf(item) === -1) { arr[arr_idxs].push(item); }
        } else {
            arr_idxs.forEach( arr_idx => this._addToSet(arr, arr_idx, item) );
        }
    }
    private _remFromSet(arr: any[], arr_idxs: number|number[], item: number, del: boolean): void {
        if (item === undefined) { return; }
        if (!Array.isArray(arr_idxs)) {
            const idx: number = arr[arr_idxs].indexOf(item);
            if (idx === -1) { return; }
            arr[arr_idxs].splice(idx, 1);
            if (del && arr[arr_idxs].length === 0) {
                delete arr[arr_idxs];
            }
        } else {
            arr_idxs.forEach( arr_idx => this._remFromSet(arr, arr_idx, item, del) );
        }
    }
    // arrays of values
    private _appToArr(arr: any[], arr_idxs: number|number[], item: number): void {
        if (!Array.isArray(arr_idxs)) {
            if (!arr[arr_idxs]) { arr[arr_idxs] = []; }
            arr[arr_idxs].push(item);
        } else {
            arr_idxs.forEach( arr_idx => this._appToArr(arr, arr_idx, item) );
        }
    }
    private _insToArr(arr: any[], arr_idxs: number|number[], item: number, idx: number): void {
        if (!Array.isArray(arr_idxs)) {
            if (!arr[arr_idxs]) { arr[arr_idxs] = []; }
            arr[arr_idxs][idx] = item;
        } else {
            arr_idxs.forEach( arr_idx => this._insToArr(arr, arr_idx, item, idx) );
        }
    }
    private _remFromArr(arr: any[], arr_idxs: number|number[], idx: number, del: boolean): void {
        if (!Array.isArray(arr_idxs)) {
            if (!arr[arr_idxs]) { arr[arr_idxs] = []; }
            if (del) {
                delete arr[arr_idxs][idx];
            } else {
                arr[arr_idxs][idx] = null;
            }
        } else {
            arr_idxs.forEach( arr_idx => this._remFromArr(arr, arr_idx, idx, del) );
        }
    }
    private _remFromArrIf(arr: any[], arr_idxs: number|number[], idx: number, val: number, del: boolean): void {
        if (!Array.isArray(arr_idxs)) {
            if (!arr[arr_idxs]) { arr[arr_idxs] = []; }
            if (arr[arr_idxs][idx] === val) {
                if (del) {
                    delete arr[arr_idxs][idx];
                } else {
                    arr[arr_idxs][idx] = null;
                }
            }
        } else {
            arr_idxs.forEach( arr_idx => this._remFromArr(arr, arr_idx, idx, del) );
        }
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
    // ============================================================================
    // Get entities
    // The arrays are passed by reference
    // The caller should be very careful how they modify the data in these arrays
    // TODO Can this be avoided?
    // ============================================================================
    // public getVertData(vert_i: number): TVert {
    //     return this._geom_arrays.dn_verts_posis[vert_i];
    // }
    // public getEdgeData(edge_i: number): TEdge {
    //     return this._geom_arrays.dn_edges_verts[edge_i];
    // }
    // public getWireData(wire_i: number): TWire {
    //     return this._geom_arrays.dn_wires_edges[wire_i];
    // }
    // public getFaceData(face_i: number): TFace {
    //     return this._geom_arrays.dn_faces_wirestris[face_i];
    // }
    // public getPointData(point_i: number): TPoint {
    //     return this._geom_arrays.dn_points_verts[point_i];
    // }
    // public getPlineData(pline_i: number): TPline {
    //     return this._geom_arrays.dn_plines_wires[pline_i];
    // }
    // public getPgonData(pgon_i: number): TPgon {
    //     return this._geom_arrays.dn_pgons_faces[pgon_i];
    // }
    // public getCollData(coll_i: number): TColl {
    //     return this._geom_arrays.dn_colls_objs[coll_i];
    // }
    // ============================================================================
    // Get trees
    // Data is copied, No internal data passed by reference
    // ============================================================================
    public entEntTree(ent_type: EEntType, ent_i: number): TTree {
        switch (ent_type) {
            case EEntType.VERT:
                return this.getVertTree(ent_i);
            case EEntType.EDGE:
                return this.getEdgeTree(ent_i);
            case EEntType.WIRE:
                return this.getWireTree(ent_i);
            case EEntType.FACE:
                return this.getFaceTree(ent_i);
            case EEntType.POINT:
                return this.getPointTree(ent_i);
            case EEntType.PLINE:
                return this.getPlineTree(ent_i);
            case EEntType.PGON:
                return this.getPgonTree(ent_i);
            case EEntType.COLL:
                return this.getCollTree(ent_i);
        }
    }
    public getVertTree(vert_i: number): TVertTree {
        const posi_i: number = this._geom_arrays.dn_verts_posis[vert_i];
        return [EEntType.VERT, vert_i, [EEntType.POSI, posi_i]];
    }
    public getEdgeTree(edge_i: number): TEdgeTree {
        const verts_i: number[] = this._geom_arrays.dn_edges_verts[edge_i];
        const first_posi_i: number = this._geom_arrays.dn_verts_posis[verts_i[0]];
        const second_posi_i: number = this._geom_arrays.dn_verts_posis[verts_i[1]];
        return [EEntType.EDGE, edge_i,
            [EEntType.VERT, verts_i[0], [EEntType.POSI, first_posi_i]],
            [EEntType.VERT, verts_i[1], [EEntType.POSI, second_posi_i]]
        ];
    }
    public getWireTree(wire_i: number): TWireTree {
        const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
        const edge_trees: TEdgeTree[] = [];
        for (const edge_i of edges_i) {
            edge_trees.push(this.getEdgeTree(edge_i)); // so we get dup vertices
        }
        return [EEntType.WIRE, wire_i, edge_trees];
    }
    public getFaceTree(face_i: number): TFaceTree {
        const wirestris: TFace = this._geom_arrays.dn_faces_wirestris[face_i];
        const wire_trees: TWireTree[] = [];
        for (const wire_i of wirestris[0]) { // ignore the tris
            wire_trees.push(this.getWireTree(wire_i));
        }
        return [EEntType.FACE, face_i, wire_trees];
    }
    public getPointTree(point_i: number): TPointTree {
        const vert_i: number = this._geom_arrays.dn_points_verts[point_i];
        const posi_i: number = this._geom_arrays.dn_verts_posis[vert_i];
        return [EEntType.POINT, point_i, [EEntType.VERT, vert_i, [EEntType.POSI, posi_i]]];
    }
    public getPlineTree(pline_i: number): TPlineTree {
        const wire_i: number = this._geom_arrays.dn_plines_wires[pline_i];
        return [EEntType.PLINE, pline_i, this.getWireTree(wire_i)];
    }
    public getPgonTree(pgon_i: number): TPgonTree {
        const face_i: number = this._geom_arrays.dn_pgons_faces[pgon_i];
        return [EEntType.PGON, pgon_i, this.getFaceTree(face_i)];
    }
    public getCollTree(coll_i: number): TCollTree {
        const coll: TColl = this._geom_arrays.dn_colls_objs[coll_i];
        return [EEntType.COLL, coll_i,
            coll[1].map(point_i => this.getPointTree(point_i)) as TPointTree[],
            coll[2].map(pline_i => this.getPlineTree(pline_i)) as TPlineTree[],
            coll[3].map(pgon_i => this.getPgonTree(pgon_i))  as TPgonTree[]
        ];
    }
    // ============================================================================
    // Get EntPack
    // Data is copied, No internal data passed by reference
    // ============================================================================
    public getVertEntPack(vert_i: number): IEntPack {
        const posi_i: number = this._geom_arrays.dn_verts_posis[vert_i];
        return { 'verts_i': [vert_i], 'posis_i': [posi_i] };
    }
    public getEdgeEntPack(edge_i: number): IEntPack {
        const verts_i: number[] = this._geom_arrays.dn_edges_verts[edge_i].slice(); // dup
        const first_posi_i: number = this._geom_arrays.dn_verts_posis[verts_i[0]];
        const second_posi_i: number = this._geom_arrays.dn_verts_posis[verts_i[1]];
        return { 'edges_i': [edge_i], 'verts_i': verts_i, 'posis_i': [first_posi_i, second_posi_i] };
    }
    public getWireEntPack(wire_i: number): IEntPack {
        const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i].slice(); // dup
        const verts_i: number[] = this.wireGetVerts(wire_i);
        const posis_i: number[] = verts_i.map( vert_i => this._geom_arrays.dn_verts_posis[vert_i]);
        return { 'wires_i': [wire_i], 'edges_i': edges_i, 'verts_i': verts_i, 'posis_i': posis_i };
    }
    public getFaceEntPack(face_i: number): IEntPack {
        const wirestris: TFace = this._geom_arrays.dn_faces_wirestris[face_i];
        const wires_i: number[] = wirestris[0].slice(); // dup
        const tris_i: number[] = wirestris[1].slice(); // dup
        const edges_i: number[] = [];
        const verts_i: number[] = [];
        const posis_i: number[] = [];
        for (const wire_i of wirestris[0]) { // ignore the tris
            const wire_edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
            edges_i.push(...wire_edges_i);
            const wire_verts_i: number[] = this.wireGetVerts(wire_i);
            verts_i.push(...wire_verts_i);
            const wire_posis_i: number[] = wire_verts_i.map( vert_i => this._geom_arrays.dn_verts_posis[vert_i]);
            posis_i.push(...wire_posis_i);
        }
        return {'faces_i': [face_i], 'tris_i': tris_i, 'wires_i': wires_i, 'edges_i': edges_i,
            'verts_i': verts_i, 'posis_i': posis_i };
    }
    public getPointEntPack(point_i: number): IEntPack {
        const vert_i: number = this._geom_arrays.dn_points_verts[point_i];
        const ent_pack: IEntPack = this.getVertEntPack(vert_i);
        ent_pack['points_i'] = [point_i];
        return ent_pack;
    }
    public getPlineEntPack(pline_i: number): IEntPack {
        const wire_i: number = this._geom_arrays.dn_plines_wires[pline_i];
        const ent_pack: IEntPack = this.getWireEntPack(wire_i);
        ent_pack['plines_i'] = [pline_i];
        return ent_pack;
    }
    public getPgonEntPack(pgon_i: number): IEntPack {
        const face_i: number = this._geom_arrays.dn_pgons_faces[pgon_i];
        const ent_pack: IEntPack = this.getFaceEntPack(face_i);
        ent_pack['faces_i'] = [face_i];
        return ent_pack;
    }
    public getCollEntPack(coll_i: number): IEntPack {
        // utility function for merging ent packs without creating any dups
        function mergeEntPacks(_ent_packs: IEntPack[]): IEntPack {
            function addToSet(_set: Set<number>, _ents_i: number[]): void {
                _ents_i.forEach( num => _set.add(num) );
            }
            const set_posis_i: Set<number> = new Set();
            const set_verts_i: Set<number> = new Set();
            const set_edges_i: Set<number> = new Set();
            const set_wires_i: Set<number> = new Set();
            const set_tris_i: Set<number> = new Set();
            const set_faces_i: Set<number> = new Set();
            const set_points_i: Set<number> = new Set();
            const set_plines_i: Set<number> = new Set();
            const set_pgons_i: Set<number> = new Set();
            const set_colls_i: Set<number> = new Set();
            for (const ent_pack of _ent_packs) {
                if ('posis_i' in ent_pack)  { addToSet(set_posis_i, ent_pack.posis_i); }
                if ('verts_i' in ent_pack)  { addToSet(set_verts_i, ent_pack.verts_i); }
                if ('edges_i' in ent_pack)  { addToSet(set_edges_i, ent_pack.edges_i); }
                if ('wires_i' in ent_pack)  { addToSet(set_wires_i, ent_pack.wires_i); }
                if ('faces_i' in ent_pack)  { addToSet(set_faces_i, ent_pack.faces_i); }
                if ('points_i' in ent_pack) { addToSet(set_points_i, ent_pack.points_i); }
                if ('plines_i' in ent_pack) { addToSet(set_plines_i, ent_pack.plines_i); }
                if ('pgons_i' in ent_pack)  { addToSet(set_pgons_i, ent_pack.pgons_i); }
                if ('colls_i' in ent_pack)  { addToSet(set_colls_i, ent_pack.colls_i); }
            }
            const merged_ent_pack: IEntPack = {
                'posis_i':  Array.from(set_posis_i),
                'verts_i':  Array.from(set_verts_i),
                'edges_i':  Array.from(set_edges_i),
                'wires_i':  Array.from(set_wires_i),
                'tris_i':   Array.from(set_tris_i),
                'faces_i':  Array.from(set_faces_i),
                'points_i': Array.from(set_points_i),
                'plines_i': Array.from(set_plines_i),
                'pgons_i':  Array.from(set_pgons_i),
                'colls_i':  Array.from(set_colls_i)
            };
            return merged_ent_pack;
        }
        const ent_packs: IEntPack[] = [];
        const coll: TColl = this._geom_arrays.dn_colls_objs[coll_i];
        // objects
        coll[1].forEach( point_i => ent_packs.push( this.getPointEntPack(point_i)) );
        coll[2].forEach( pline_i => ent_packs.push( this.getPlineEntPack(pline_i)) );
        coll[3].forEach( pgon_i =>  ent_packs.push( this.getPgonEntPack(pgon_i)) );
        // child collections
        const colls_i: number[] = this.collGetChildren(coll_i);
        colls_i.forEach( child_coll_i =>  ent_packs.push( this.getCollEntPack(child_coll_i)) );
        return mergeEntPacks(ent_packs);
    }
    // ============================================================================
    // Get EntPack
    // Data is copied, No internal data passed by reference
    // ============================================================================
    /**
     * Returns a geompack of unique indexes for a collection.
     *
     * This includes nested collections..
     */
    public getCollGeomPack(coll_i: number): IGeomPack {
        const set_colls_i: Set<number> = new Set();
        const set_pgons_i: Set<number> = new Set();
        const set_plines_i: Set<number> = new Set();
        const set_points_i: Set<number> = new Set();
        const set_posis_i: Set<number> = new Set();
        // get all the descendents of this collection
        const desc_colls_i: number[] = this.collGetDescendents(coll_i);
        // add this coll the head of the list
        desc_colls_i.splice(0, 0, coll_i);
        // go through each coll
        for (const desc_coll_i of desc_colls_i) {
            set_colls_i.add(desc_coll_i);
            for (const pgon_i of this.navCollToPgon(desc_coll_i)) {
                set_pgons_i.add(pgon_i);
                this.navAnyToPosi(EEntType.PGON, pgon_i).forEach( posi_i => set_posis_i.add(posi_i) );
            }
            for (const pline_i of this.navCollToPline(desc_coll_i)) {
                set_plines_i.add(pline_i);
                this.navAnyToPosi(EEntType.PLINE, pline_i).forEach( posi_i => set_posis_i.add(posi_i) );
            }
            for (const point_i of this.navCollToPoint(desc_coll_i)) {
                set_points_i.add(point_i);
                this.navAnyToPosi(EEntType.POINT, point_i).forEach( posi_i => set_posis_i.add(posi_i) );
            }
        }
        return {
            posis_i: Array.from(set_posis_i),
            points_i: Array.from(set_points_i),
            plines_i: Array.from(set_plines_i),
            pgons_i: Array.from(set_pgons_i),
            colls_i: Array.from(set_colls_i)
        };
    }
    /**
     * Returns a geompack of unique indexes, given an array of TEntTypeIdx.
     *
     * Object positions are added to the geompack.
     *
     * Collections contents is added to the geompack, including nested collections..
     *
     * If invert=true, then the geompack will include the opposite set of entities.
     *
     * Used for deleting all entities.
     */
    public createGeomPackFromEnts(ents: TEntTypeIdx[], invert: boolean = false): IGeomPack {
        // utility function for adding to set
        function addToSet(_set: Set<number>, _ents_i: number[]): void {
            _ents_i.forEach( num => _set.add(num) );
        }
        // utility function for inverting a geompack
        function _invertGeomPack(_sets: Set<number>[], _ga: IGeomArrays): IGeomPack {
            const inv_posis_i: number[] = [];
            for (let i = 0; i < _ga.up_posis_verts.length; i++) {
                if (_ga.up_posis_verts[i] !== null && !_sets[0].has(i)) { inv_posis_i.push(i); }
            }
            const inv_points_i: number[] = [];
            for (let i = 0; i < _ga.dn_points_verts.length; i++) {
                if (_ga.dn_points_verts[i] !== null && !_sets[1].has(i)) { inv_points_i.push(i); }
            }
            const inv_plines_i: number[] = [];
            for (let i = 0; i < _ga.dn_plines_wires.length; i++) {
                if (_ga.dn_plines_wires[i] !== null && !_sets[2].has(i)) { inv_plines_i.push(i); }
            }
            const inv_pgons_i: number[] = [];
            for (let i = 0; i < _ga.dn_pgons_faces.length; i++) {
                if (_ga.dn_pgons_faces[i] !== null && !_sets[3].has(i)) { inv_pgons_i.push(i); }
            }
            const inv_colls_i: number[] = [];
            for (let i = 0; i < _ga.dn_colls_objs.length; i++) {
                if (_ga.dn_colls_objs[i] !== null && !_sets[4].has(i)) { inv_colls_i.push(i); }
            }
            return {
                posis_i: inv_posis_i,
                points_i: inv_points_i,
                plines_i: inv_plines_i,
                pgons_i: inv_pgons_i,
                colls_i: inv_colls_i
            };
        }
        // ---------------------------------------
        // create sets for the geompack
        const set_posis_i: Set<number> = new Set();
        const set_points_i: Set<number> = new Set();
        const set_plines_i: Set<number> = new Set();
        const set_pgons_i: Set<number> = new Set();
        const set_colls_i: Set<number> = new Set();
        // put ents into sets
        for (const ent_arr of ents) {
            const [ent_type, index]: TEntTypeIdx = ent_arr as TEntTypeIdx;
            // add posis
            addToSet(set_posis_i, this.navAnyToPosi(ent_type, index));
            // add other ent types
            if (isColl(ent_type)) {
                set_colls_i.add(index);
                const coll_gp: IGeomPack = this.getCollGeomPack(index);
                if ('posis_i' in coll_gp)  { addToSet(set_posis_i,  coll_gp.posis_i); }
                if ('points_i' in coll_gp) { addToSet(set_points_i, coll_gp.points_i); }
                if ('plines_i' in coll_gp) { addToSet(set_plines_i, coll_gp.plines_i); }
                if ('pgons_i' in coll_gp)  { addToSet(set_pgons_i,  coll_gp.pgons_i); }
                if ('colls_i' in coll_gp)  { addToSet(set_colls_i,  coll_gp.colls_i); }
            } else if (isPgon(ent_type)) {
                set_pgons_i.add(index);
            } else if (isPline(ent_type)) {
                set_plines_i.add(index);
            } else if (isPoint(ent_type)) {
                set_points_i.add(index);
            } else if (isPosi(ent_type)) {
                set_posis_i.add(index);
            }
        }
        // no invert?, return the geom pack
        if (!invert) {
            return {
                posis_i: Array.from(set_posis_i),
                points_i: Array.from(set_points_i),
                plines_i: Array.from(set_plines_i),
                pgons_i: Array.from(set_pgons_i),
                colls_i: Array.from(set_colls_i)
            };
        }
        // invert? invert and then return geom pack
        return _invertGeomPack([ set_posis_i, set_points_i, set_plines_i, set_pgons_i, set_colls_i ], this._geom_arrays);
    }
    // ============================================================================
    // Add entities into the data structure
    // Updates the links to the ents immediatley below the ent being inserted
    //   down - a link from this ent down to the ent below it
    //   up - a link from the ent below this ent up to this ent
    // Does not update any links to the ents above, but instead returns the ent_i
    // ============================================================================
    public addPosiEnt(): number {
        return this._geom_arrays.up_posis_verts.push([]) - 1;
    }
    public addVertEnt(vert: TVert): number {
        // down
        const vert_i: number = this._geom_arrays.dn_verts_posis.push(vert) - 1;
        // up
        this._addToSet(this._geom_arrays.up_posis_verts, vert, vert_i);
        // return
        return vert_i;
    }
    public addEdgeEnt(edge: TEdge): number {
        // down
        const edge_i: number =  this._geom_arrays.dn_edges_verts.push(edge) - 1;
        // up
        this._insToArr(this._geom_arrays.up_verts_edges, edge[0], edge_i, 1);
        this._insToArr(this._geom_arrays.up_verts_edges, edge[1], edge_i, 0);
        // return
        return edge_i;
    }
    public addEdgeEnts(verts_i: number[], is_closed: boolean): number[] {
        const edges_i: number[] = [];
        for (let i = 0; i < verts_i.length - 1; i++) {
            const edge: TEdge = [verts_i[i], verts_i[i + 1]];
            edges_i.push( this.addEdgeEnt(edge) );
        }
        if (is_closed) {
            const last_edge: TEdge = [verts_i[verts_i.length - 1], verts_i[0]];
            edges_i.push( this.addEdgeEnt(last_edge));
        }
        return edges_i;
    }
    public addTriEnt(tri: TTri): number {
        // down
        const tri_i: number =  this._geom_arrays.dn_tris_verts.push(tri) - 1;
        // up
        this._addToSet(this._geom_arrays.up_verts_tris, tri, tri_i);
        // return
        return tri_i;
    }
    public addWireEnt(wire: TWire): number {
        // down
        const wire_i: number =  this._geom_arrays.dn_wires_edges.push(wire) - 1;
        // up
        this._set(this._geom_arrays.up_edges_wires, wire, wire_i);
        // return
        return wire_i;
    }
    public addFaceEnt(face: TFace): number {
        // down
        const face_i: number =  this._geom_arrays.dn_faces_wirestris.push(face) - 1;
        // up
        this._set(this._geom_arrays.up_wires_faces, face[0], face_i);
        this._set(this._geom_arrays.up_tris_faces, face[1], face_i);
        // return
        return face_i;
    }
    public addPointEnt(point: TPoint): number {
        // down
        const point_i: number =  this._geom_arrays.dn_points_verts.push(point) - 1;
        // up
        this._set(this._geom_arrays.up_verts_points, point, point_i);
        // return
        return point_i;
    }
    public addPlineEnt(pline: TPline): number {
        // down
        const pline_i: number =  this._geom_arrays.dn_plines_wires.push(pline) - 1;
        // up
        this._set(this._geom_arrays.up_wires_plines, pline, pline_i);
        // return
        return pline_i;
    }
    public addPgonEnt(pgon: TPgon): number {
        // down
        const pgon_i: number =  this._geom_arrays.dn_pgons_faces.push(pgon) - 1;
        // up
        this._set(this._geom_arrays.up_faces_pgons, pgon, pgon_i);
        // return
        return pgon_i;
    }
    public addCollEnt(coll: TColl): number {
        // down
        const coll_i: number = this._geom_arrays.dn_colls_objs.push(coll) - 1;
        // up
        this._addToSet(this._geom_arrays.up_points_colls, coll[1], coll_i); // points
        this._addToSet(this._geom_arrays.up_plines_colls, coll[2], coll_i); // plines
        this._addToSet(this._geom_arrays.up_pgons_colls,  coll[3], coll_i); // pgons
        // return
        return coll_i;
    }
    // ============================================================================
    // Remove entities from the datastructure
    // Updates the links to the ents immediatley below the ent being removed
    //   down - a link from this ent down to the ent below it
    //   up - a link from the ent below this ent up to this ent
    // Does not update any links to the ents above, but instead returns the ent_i
    // Returns teh entity that was removed
    // ============================================================================
    public remPosiEnt(posi_i: number): number[] { // return array of vert_i
        // up
        const verts_i: number[] = this._geom_arrays.up_posis_verts[posi_i];
        if (verts_i === null) { return null; }
        // remove up
        this._clear(this._geom_arrays.up_posis_verts, posi_i, false);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.POSI, posi_i);
        // return
        return verts_i;
    }
    public remVertEnt(vert_i: number): TVert {
        // down
        const vert: TVert = this._geom_arrays.dn_verts_posis[vert_i];
        if (vert === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_verts_posis, vert_i, false);
        // remove up
        const posi_i: number = vert;
        this._remFromSet(this._geom_arrays.up_posis_verts, posi_i, vert_i, false);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.VERT, vert_i);
        // return
        return vert;
    }
    public remEdgeEnt(edge_i: number): TEdge {
        // down
        const edge: TEdge = this._geom_arrays.dn_edges_verts[edge_i];
        if (edge === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_edges_verts, edge_i, false);
        // remove up
        const [start_vert_i, end_vert_i]: [number, number] = edge;
        this._remFromArrIf(this._geom_arrays.up_verts_edges, start_vert_i, 1, edge_i, true);
        this._remFromArrIf(this._geom_arrays.up_verts_edges, end_vert_i, 0, edge_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.EDGE, edge_i);
        // return
        return edge;
    }
    public remTriEnt(tri_i: number): TTri {
        // down
        const tri: TTri = this._geom_arrays.dn_tris_verts[tri_i];
        if (tri === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_tris_verts, tri_i, false);
        // remove up
        const verts_i: [number, number, number] = tri;
        this._remFromSet(this._geom_arrays.up_verts_tris, verts_i, tri_i, true);
        // no attribs
        // return
        return tri;
    }
    public remWireEnt(wire_i: number): TWire {
        // down
        const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
        if (wire === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_wires_edges, wire_i, false);
        // remove up
        const edges_i: number[] = wire;
        this._clearIf(this._geom_arrays.up_edges_wires, edges_i, wire_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.WIRE, wire_i);
        // return
        return wire;
    }
    public remFaceEnt(face_i: number): TFace {
        // down
        const face: TFace = this._geom_arrays.dn_faces_wirestris[face_i];
        if (face === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_faces_wirestris, face_i, false);
        // remove up
        const wires_i: number[] = face[0];
        this._clearIf(this._geom_arrays.up_wires_faces, wires_i, face_i, true);
        const tris_i: number[] = face[1];
        this._clearIf(this._geom_arrays.up_tris_faces, tris_i, face_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.FACE, face_i);
        // return
        return face;
    }
    public remPointEnt(point_i: number): TPoint {
        // down
        const point: TPoint = this._geom_arrays.dn_points_verts[point_i];
        if (point === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_points_verts, point_i, false);
        // remove up
        const vert_i: number = point;
        this._clearIf(this._geom_arrays.up_verts_points, vert_i, point_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.POINT, point_i);
        // return
        return point;
    }
    public remPlineEnt(pline_i: number): TPline  {
        // down
        const pline: TPline = this._geom_arrays.dn_plines_wires[pline_i];
        if (pline === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_plines_wires, pline_i, false);
        // remove up
        const wire_i: number = pline;
        this._clearIf(this._geom_arrays.up_wires_plines, wire_i, pline_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.PLINE, pline_i);
        // return
        return pline;
    }
    public remPgonEnt(pgon_i: number): TPgon {
        // down
        const pgon: TPgon = this._geom_arrays.dn_pgons_faces[pgon_i];
        if (pgon === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_pgons_faces, pgon_i, false);
        // remove up
        const face_i: number = pgon;
        this._clearIf(this._geom_arrays.up_faces_pgons, face_i, pgon_i, true);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.PGON, pgon_i);
        // return
        return pgon;
    }
    public remCollEnt(coll_i: number): TColl {
        // down
        const coll: TColl = this._geom_arrays.dn_colls_objs[coll_i];
        if (coll === null) { return null; }
        // remove down
        this._clear(this._geom_arrays.dn_colls_objs, coll_i, false);
        // delete attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.COLL, coll_i);
        // return
        return coll;
    }
    // ============================================================================
    // Insert an entity, replacing an existing entity in the process
    // These methods do not remove anything
    // Bidirectional
    // Data is copied
    // ============================================================================
    public insVertEnt(vert: TVert, vert_i: number): void {
        // down
        this._geom_arrays.dn_verts_posis[vert_i] = vert;
        // up
        this._addToSet(this._geom_arrays.up_posis_verts, vert, vert_i);
    }
    public insEdgeEnt(edge: TEdge, edge_i: number): void {
        edge = edge.slice() as TEdge;
        // down
        this._geom_arrays.dn_edges_verts[edge_i] = edge;
        // up
        this._insToArr(this._geom_arrays.up_verts_edges, edge[0], edge_i, 1);
        this._insToArr(this._geom_arrays.up_verts_edges, edge[1], edge_i, 0);
    }
    public insWireEnt(wire: TWire, wire_i: number): void {
        wire = wire.slice() as TWire;
        // down
        this._geom_arrays.dn_wires_edges[wire_i] = wire;
        // up
        this._set(this._geom_arrays.up_edges_wires, wire, wire_i);
    }
    public insFaceEnt(face: TFace, face_i: number): void {
        face = [face[0].slice(), face[1].slice()] as TFace;
        // down
        this._geom_arrays.dn_faces_wirestris[face_i] = face;
        // up
        this._set(this._geom_arrays.up_wires_faces, face[0], face_i);
        this._set(this._geom_arrays.up_tris_faces, face[1], face_i);
    }
    public insPointEnt(point: TPoint, point_i: number): void {
        // down
        this._geom_arrays.dn_points_verts[point_i] = point;
        // up
        this._set(this._geom_arrays.up_verts_points, point, point_i);
    }
    public insPlineEnt(pline: TPline, pline_i: number): void {
        // down
        this._geom_arrays.dn_plines_wires[pline_i] = pline;
        // up
        this._set(this._geom_arrays.up_wires_plines, pline, pline_i);
    }
    public insPgonEnt(pgon: TPgon, pgon_i: number): void {
        // down
        this._geom_arrays.dn_pgons_faces[pgon_i] = pgon;
        // up
        this._set(this._geom_arrays.up_faces_pgons, pgon, pgon_i);
    }
    public insCollEnt(coll: TColl, coll_i: number): void {
        coll = [coll[0], coll[1].slice(), coll[2].slice(), coll[3].slice()] as TColl;
        // down
        this._geom_arrays.dn_colls_objs[coll_i] = coll;
        // up
        this._addToSet(this._geom_arrays.up_points_colls, coll[1], coll_i); // points
        this._addToSet(this._geom_arrays.up_plines_colls, coll[2], coll_i); // plines
        this._addToSet(this._geom_arrays.up_pgons_colls,  coll[3], coll_i); // pgons
    }
    // ============================================================================
    // Link entities
    // Bidirectional
    // ============================================================================
    public linkVertPosi(vert_i: number, posi_i: number): void {
        // down
        this._geom_arrays.dn_verts_posis[vert_i] = posi_i;
        // up
        this._addToSet(this._geom_arrays.up_posis_verts, posi_i, vert_i);
    }
    public linkEdgeStartVert(edge_i: number, vert_i: number): void {
        // down
        this._geom_arrays.dn_edges_verts[edge_i][0] = vert_i;
        // up
        const edges_i: number[] = this._geom_arrays.up_verts_edges[vert_i];
        if (edges_i === undefined) {
            this._geom_arrays.up_verts_edges[vert_i] = [undefined, edge_i]; // TODO Not sure about this
        } else {
            this._geom_arrays.up_verts_edges[vert_i][1] = edge_i;
        }
    }
    public linkEdgeEndVert(edge_i: number, vert_i: number): void {
        // down
        this._geom_arrays.dn_edges_verts[edge_i][1] = vert_i;
        // up
        const edges_i: number[] = this._geom_arrays.up_verts_edges[vert_i];
        if (edges_i === undefined) {
            this._geom_arrays.up_verts_edges[vert_i] = [edge_i, undefined]; // TODO Not sure about this
        } else {
            this._geom_arrays.up_verts_edges[vert_i][0] = edge_i;
        }
    }
    public linkWireEdge(wire_i: number, idx: number,  edge_i: number): void {
        // down
        this._geom_arrays.dn_wires_edges[wire_i][idx] = edge_i;
        // up
        this._geom_arrays.up_edges_wires[edge_i] = wire_i;
    }
    public linkFaceTri(face_i: number, tri_i: number): void {
        // down
        this._geom_arrays.dn_faces_wirestris[face_i][1].push(tri_i);
        // up
        this._geom_arrays.up_tris_faces[tri_i] = face_i;
    }
    public linkFaceWire(face_i: number, idx: number, wire_i: number): void {
        // down
        this._geom_arrays.dn_faces_wirestris[face_i][0][idx] = wire_i;
        // up
        this._geom_arrays.up_wires_faces[wire_i] = face_i;
    }
    public linkPointVert(point_i: number, vert_i: number): void {
        // down
        this._geom_arrays.dn_points_verts[point_i] = vert_i;
        // up
        this._geom_arrays.up_verts_points[vert_i] = point_i;
    }
    public linkPlineWire(pline_i: number, wire_i: number): void {
        // down
        this._geom_arrays.dn_plines_wires[pline_i] = wire_i;
        // up
        this._geom_arrays.up_wires_plines[wire_i] = pline_i;
    }
    public linkPgonFace(pgon_i: number, face_i: number): void {
        // down
        this._geom_arrays.dn_pgons_faces[pgon_i] = face_i;
        // up
        this._geom_arrays.up_faces_pgons[face_i] = pgon_i;
    }
    public linkCollPoint(coll_i: number, point_i: number): void {
        // down
        this._addToSet(this._geom_arrays.dn_colls_objs, 1, point_i);
        // up
        this._addToSet(this._geom_arrays.up_points_colls, point_i, coll_i);
    }
    public linkCollPline(coll_i: number, pline_i: number): void {
        // down
        this._addToSet(this._geom_arrays.dn_colls_objs, 2, pline_i);
        // up
        this._addToSet(this._geom_arrays.up_plines_colls, pline_i, coll_i);
    }
    public linkCollPgon(coll_i: number, pgon_i: number): void {
        // down
        this._addToSet(this._geom_arrays.dn_colls_objs, 3, pgon_i);
        // up
        this._addToSet(this._geom_arrays.up_pgons_colls, pgon_i, coll_i);
    }
    // ============================================================================
    // Unlink entities
    // Bidirectional if down
    // Non-didirectional if up
    // ============================================================================
    public unlinkVertPosi(vert_i: number, posi_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_verts_posis, vert_i, false);
        // up
        this._remFromSet(this._geom_arrays.up_posis_verts, posi_i, vert_i, true);
    }
    public unlinkPosiToVert(posi_i: number, vert_i: number): void {
        // up
        this._remFromSet(this._geom_arrays.up_posis_verts, posi_i, vert_i, true);
    }
    public unlinkEdgeStartVert(edge_i: number, vert_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_edges_verts[edge_i], 0, false);
        // up
        if (this._geom_arrays.up_verts_edges[vert_i] === undefined) { return; } // TODO is this needed
        this._clearIf(this._geom_arrays.up_verts_edges[vert_i], 1, edge_i, true);
    }
    public unlinkEdgeEndVert(edge_i: number, vert_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_edges_verts[edge_i], 1, false);
        // up
        if (this._geom_arrays.up_verts_edges[vert_i] === undefined) { return; } // TODO is this needed
        this._clearIf( this._geom_arrays.up_verts_edges[vert_i], 0, edge_i, true);
    }
    public unlinkVertToEdge(vert_i: number, edge_i: number): void {
        // up
        if (this._geom_arrays.up_verts_edges[vert_i] === undefined) { return; } // TODO is this needed
        this._clearIf(this._geom_arrays.up_verts_edges[vert_i], 1, edge_i, true);
    }
    public unlinkWireEdge(wire_i: number, edge_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_wires_edges, wire_i, edge_i, false);
        // up
        this._clearIf( this._geom_arrays.up_edges_wires, edge_i, wire_i, true);
    }
    public unlinkEdgeToWire(edge_i: number, wire_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_edges_wires, edge_i, wire_i, true);
    }
    public unlinkFaceTri(face_i: number, tri_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_faces_wirestris[face_i], 1, tri_i, false);
        // up
        this._clearIf( this._geom_arrays.up_tris_faces, tri_i, face_i, true);
    }
    public unlinkTriToFace(tri_i: number, face_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_tris_faces, tri_i, face_i, true);
    }
    public unlinkFaceWire(face_i: number, wire_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_faces_wirestris[face_i], 0, wire_i, false);
        // up
        this._clearIf( this._geom_arrays.up_wires_faces, wire_i, face_i, true);
    }
    public unlinkWireToFace(wire_i: number, face_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_wires_faces, wire_i, face_i, true);
    }
    public unlinkPointVert(point_i: number, vert_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_points_verts, point_i, false);
        // up
        this._clearIf( this._geom_arrays.up_verts_points, vert_i, point_i, true);
    }
    public unlinkVertToPoint(vert_i: number, point_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_verts_points, vert_i, point_i, true);
    }
    public unlinkPlineWire(pline_i: number, wire_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_plines_wires, pline_i, false);
        // up
        this._clearIf( this._geom_arrays.up_wires_plines, wire_i, pline_i, true);
    }
    public unlinkWireToPline(wire_i: number, pline_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_wires_plines, wire_i, pline_i, true);
    }
    public unlinkPgonFace(pgon_i: number, face_i: number): void {
        // down
        this._clear(this._geom_arrays.dn_pgons_faces, pgon_i, false);
        // up
        this._clearIf( this._geom_arrays.up_faces_pgons, face_i, pgon_i, true);
    }
    public unlinkFaceToPgon(face_i: number, pgon_i: number): void {
        // up
        this._clearIf( this._geom_arrays.up_faces_pgons, face_i, pgon_i, true);
    }
    public unlinkCollPoint(coll_i: number, point_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_colls_objs, 1, point_i, false);
        // up
        this._remFromSet(this._geom_arrays.up_points_colls, point_i, coll_i, true);
    }
    public unlinkPointToColl(point_i: number, coll_i: number): void {
        // up
        this._remFromSet(this._geom_arrays.up_points_colls, point_i, coll_i, true);
    }
    public unlinkCollPline(coll_i: number, pline_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_colls_objs, 2, pline_i, false);
        // up
        this._remFromSet(this._geom_arrays.up_plines_colls, pline_i, coll_i, true);
    }
    public unlinkPlineToColl(pline_i: number, coll_i: number): void {
        // up
        this._remFromSet(this._geom_arrays.up_plines_colls, pline_i, coll_i, true);
    }
    public unlinkCollPgon(coll_i: number, pgon_i: number): void {
        // down
        this._remFromSet(this._geom_arrays.dn_colls_objs, 3, pgon_i, false);
        // up
        this._remFromSet(this._geom_arrays.up_pgons_colls, pgon_i, coll_i, true);
    }
    public unlinkPgonToColl(pgon_i: number, coll_i: number): void {
        // up
        this._remFromSet(this._geom_arrays.up_pgons_colls, pgon_i, coll_i, true);
    }
    // ============================================================================
    // Navigate down the hierarchy
    // No internal data passed by reference.
    // ============================================================================
    public navVertToPosi(vert_i: number): number {
        return this._geom_arrays.dn_verts_posis[vert_i];
    }
    public navTriToVert(tri_i: number): [number, number, number] {
        const ents_i: number[] = this._geom_arrays.dn_tris_verts[tri_i];
        if (ents_i) { return ents_i.slice() as [number, number, number]; }
        return ents_i as [number, number, number];
    }
    public navEdgeToVert(edge_i: number): [number, number] {
        const ents_i: number[] = this._geom_arrays.dn_edges_verts[edge_i];
        if (ents_i) { return ents_i.slice() as [number, number]; }
        return ents_i as [number, number];
    }
    public navWireToEdge(wire_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
        if (ents_i) { return ents_i.slice(); }
        return ents_i;
    }
    public navFaceToWire(face_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.dn_faces_wirestris[face_i][0];
        if (ents_i) { return ents_i.slice(); }
        return ents_i;
    }
    public navFaceToTri(face_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.dn_faces_wirestris[face_i][1];
        if (ents_i) { return ents_i.slice(); }
        return ents_i;
    }
    public navPointToVert(point_i: number): number {
        return this._geom_arrays.dn_points_verts[point_i];
    }
    public navPlineToWire(line_i: number): number {
        return this._geom_arrays.dn_plines_wires[line_i];
    }
    public navPgonToFace(pgon_i: number): number {
        return this._geom_arrays.dn_pgons_faces[pgon_i];
    }
    public navCollToPoint(coll_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.dn_colls_objs[coll_i][1];
        if (ents_i) { return ents_i.slice(); }
        return ents_i; // coll points
    }
    public navCollToPline(coll_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.dn_colls_objs[coll_i][2];
        if (ents_i) { return ents_i.slice(); }
        return ents_i; // coll lines
    }
    public navCollToPgon(coll_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.dn_colls_objs[coll_i][3];
        if (ents_i) { return ents_i.slice(); }
        return ents_i; // coll pgons
    }
    public navCollToColl(coll_i: number): number {
        return coll_i[0]; // coll parent
    }
    // ============================================================================
    // Navigate up the hierarchy
    // No internal data passed by reference.
    // ============================================================================
    public navPosiToVert(posi_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.up_posis_verts[posi_i];
        if (ents_i) { return ents_i.slice(); }
        return ents_i;
    }
    public navVertToTri(vert_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.up_verts_tris[vert_i];
        if (ents_i) { return ents_i.slice(); }
        return ents_i;
    }
    public navVertToEdge(vert_i: number): [number, number] {
        const ents_i: number[] = this._geom_arrays.up_verts_edges[vert_i];
        if (ents_i) { return ents_i.slice() as [number, number]; }
        return ents_i as [number, number];
    }
    public navTriToFace(tri_i: number): number {
        return this._geom_arrays.up_tris_faces[tri_i];
    }
    public navEdgeToWire(edge_i: number): number {
        return this._geom_arrays.up_edges_wires[edge_i];
    }
    public navWireToFace(wire_i: number): number {
        return this._geom_arrays.up_wires_faces[wire_i];
    }
    public navVertToPoint(vert_i: number): number {
        return this._geom_arrays.up_verts_points[vert_i];
    }
    public navWireToPline(wire_i: number): number {
        return this._geom_arrays.up_wires_plines[wire_i];
    }
    public navFaceToPgon(face: number): number {
        return this._geom_arrays.up_faces_pgons[face];
    }
    public navPointToColl(point_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.up_points_colls[point_i];
        if (ents_i) { return ents_i.slice(); }
        return ents_i;
    }
    public navPlineToColl(line_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.up_plines_colls[line_i];
        if (ents_i) { return ents_i.slice(); }
        return ents_i;
    }
    public navPgonToColl(pgon_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.up_pgons_colls[pgon_i];
        if (ents_i) { return ents_i.slice(); }
        return ents_i;
    }
    // ============================================================================
    // Navigate from any level to ? (up or down)
    // ============================================================================
    /**
     * Navigate from any level to the colls
     * @param ent_type
     * @param index
     */
    public navAnyToColl(ent_type: EEntType, index: number): number[] {
        if (isColl(ent_type)) { return [index]; }
        const points_i: number[] = this.navAnyToPoint(ent_type, index);
        const colls1_i: number[] = [].concat(...points_i.map(point_i => this.navPointToColl(point_i)));
        const plines_i: number[] = this.navAnyToPline(ent_type, index);
        const colls2_i: number[] = [].concat(...plines_i.map(pline_i => this.navPlineToColl(pline_i)));
        const pgons_i: number[] = this.navAnyToPgon(ent_type, index);
        const colls3_i: number[] = [].concat(...pgons_i.map(pgon_i => this.navPgonToColl(pgon_i)));
        return Array.from(new Set([...colls1_i, ...colls2_i, ...colls3_i])).filter(coll_i => coll_i !== undefined); // remove duplicates
    }
    /**
     * Navigate from any level to the pgons
     * @param ent_type
     * @param index
     */
    public navAnyToPgon(ent_type: EEntType, index: number): number[] {
        if (isPgon(ent_type)) { return [index]; }
        const faces_i: number[] = this.navAnyToFace(ent_type, index);
        return faces_i.map( face_i => this.navFaceToPgon(face_i) ).filter(pgon_i => pgon_i !== undefined);
    }
    /**
     * Navigate from any level to the plines
     * @param ent_type
     * @param index
     */
    public navAnyToPline(ent_type: EEntType, index: number): number[] {
        if (isPline(ent_type)) { return [index]; }
        const wires_i: number[] = this.navAnyToWire(ent_type, index);
        return wires_i.map( wire_i => this.navWireToPline(wire_i) ).filter(pline_i => pline_i !== undefined);
    }
    /**
     * Navigate from any level to the points
     * @param ent_type
     * @param index
     */
    public navAnyToPoint(ent_type: EEntType, index: number): number[] {
        if (isPoint(ent_type)) { return [index]; }
        const verts_i: number[] = this.navAnyToVert(ent_type, index);
        return verts_i.map( vert_i => this.navVertToPoint(vert_i) ).filter(point_i => point_i !== undefined);
    }
    /**
     * Navigate from any level to the faces
     * @param ent_type
     * @param index
     */
    public navAnyToFace(ent_type: EEntType, index: number): number[] {
        if (isPosi(ent_type)) {
            const verts_i: number[] = this.navPosiToVert(index);
            // avoid getting duplicates
            const faces_i_set: Set<number> = new Set();
            for (const vert_i of verts_i) {
                const faces_i: number[] = this.navAnyToFace(EEntType.VERT, vert_i);
                for (const face_i of faces_i) {
                    faces_i_set.add(face_i);
                }
            }
            return Array.from(new Set(faces_i_set));
        } else if (isVert(ent_type)) {
            const edges_i: number[] = this.navVertToEdge(index);
            return [].concat(...edges_i.map( edge_i => this.navAnyToFace(EEntType.EDGE, edge_i) ));
        } else if (isTri(ent_type)) {
            return [this.navTriToFace(index)];
        } else if (isEdge(ent_type)) {
            const wire_i: number = this.navEdgeToWire(index);
            return this.navAnyToFace(EEntType.WIRE, wire_i);
        } else if (isWire(ent_type)) {
            return [this.navWireToFace(index)];
        } else if (isFace(ent_type)) { // target
            return [index];
        } else if (isPoint(ent_type)) {
            return [];
        } else if (isPline(ent_type)) {
            return [];
        } else if (isPgon(ent_type)) {
            return [this.navPgonToFace(index)];
        } else if (isColl(ent_type)) {
            const pgons_i: number[] = this.navCollToPgon(index);
            return pgons_i.map(pgon_i => this.navPgonToFace(pgon_i));
        }
        throw new Error('Bad navigation in geometry data structure: ' + ent_type + index);
    }
    /**
     * Navigate from any level to the wires
     * @param ent_type
     * @param index
     */
    public navAnyToWire(ent_type: EEntType, index: number): number[] {
        if (isPosi(ent_type)) {
            const verts_i: number[] = this.navPosiToVert(index);
            // avoid getting duplicates
            const wires_i_set: Set<number> = new Set();
            for (const vert_i of verts_i) {
                const wires_i: number[] = this.navAnyToWire(EEntType.VERT, vert_i);
                for (const wire_i of wires_i) {
                    wires_i_set.add(wire_i);
                }
            }
            return Array.from(new Set(wires_i_set));
        } else if (isVert(ent_type)) {
            const edges_i: number[] = this.navVertToEdge(index);
            return [].concat(...edges_i.map( edge_i => this.navEdgeToWire(edge_i) ));
        } else if (isTri(ent_type)) {
            return [];
        } else if (isEdge(ent_type)) {
            return [this.navEdgeToWire(index)];
        } else if (isWire(ent_type)) { // target
            return [index];
        } else if (isFace(ent_type)) {
            return this.navFaceToWire(index);
        } else if (isPoint(ent_type)) {
            return [];
        } else if (isPline(ent_type)) {
            return [this.navPlineToWire(index)];
        } else if (isPgon(ent_type)) {
            const face_i: number = this.navPgonToFace(index);
            return this.navFaceToWire(face_i);
        } else if (isColl(ent_type)) {
            const all_wires_i: number[] = [];
            const plines_i: number[] = this.navCollToPline(index);
            for (const pline_i of plines_i) {
                const wire_i: number = this.navPlineToWire(pline_i);
                all_wires_i.push(wire_i);
            }
            const pgons_i: number[] = this.navCollToPgon(index);
            for (const pgon_i of pgons_i) {
                const wires_i: number[] = this.navAnyToWire(EEntType.PGON, pgon_i);
                for (const wire_i of wires_i) {
                    all_wires_i.push(wire_i);
                }
            }
            return all_wires_i;
        }
        throw new Error('Bad navigation in geometry data structure: ' + ent_type + index);
    }
    /**
     * Navigate from any level to the edges
     * @param ent_type
     * @param index
     */
    public navAnyToEdge(ent_type: EEntType, index: number): number[] {
        if (isPosi(ent_type)) {
            const verts_i: number[] = this.navPosiToVert(index);
            return [].concat(...verts_i.map( vert_i => this.navVertToEdge(vert_i) ));
        } else if (isVert(ent_type)) {
            return this.navVertToEdge(index);
        } else if (isTri(ent_type)) {
            return [];
        } else if (isEdge(ent_type)) {
            return [index];
        } else if (isWire(ent_type)) {
            return this.navWireToEdge(index);
        } else if (isFace(ent_type)) {
            const wires_i: number[] = this.navFaceToWire(index);
            return [].concat(...wires_i.map(wire_i => this.navWireToEdge(wire_i)));
        } else if (isPoint(ent_type)) {
            return [];
        } else if (isPline(ent_type)) {
            const wire_i: number = this.navPlineToWire(index);
            return this.navAnyToEdge(EEntType.WIRE, wire_i);
        } else if (isPgon(ent_type)) {
            const face_i: number = this.navPgonToFace(index);
            return this.navAnyToEdge(EEntType.FACE, face_i);
        } else if (isColl(ent_type)) {
            const all_edges_i: number[] = [];
            const plines_i: number[] = this.navCollToPline(index);
            for (const pline_i of plines_i) {
                const edges_i: number[] = this.navAnyToVert(EEntType.PLINE, pline_i);
                for (const edge_i of edges_i) {
                    all_edges_i.push(edge_i);
                }
            }
            const pgons_i: number[] = this.navCollToPgon(index);
            for (const pgon_i of pgons_i) {
                const edges_i: number[] = this.navAnyToVert(EEntType.PGON, pgon_i);
                for (const edge_i of edges_i) {
                    all_edges_i.push(edge_i);
                }
            }
            return all_edges_i;
        }
        throw new Error('Bad navigation in geometry data structure: ' + ent_type + index);
    }
    /**
     * Navigate from any level to the vertices
     * @param ent_type
     * @param index
     */
    public navAnyToVert(ent_type: EEntType, index: number): number[] {
        if (isPosi(ent_type)) {
            return this.navPosiToVert(index);
        } else if (isVert(ent_type)) {
            return [index];
        } else if (isTri(ent_type)) {
            return this.navTriToVert(index);
        } else if (isEdge(ent_type)) {
            return this.navEdgeToVert(index);
        } else if (isWire(ent_type)) {
            return this.wireGetVerts(index); // avoids duplicate verts
        } else if (isFace(ent_type)) {
            const wires_i: number[] = this.navFaceToWire(index);
            const verts_i: number[] = [];
            for (const wire_i of wires_i) {
                const wire_verts_i: number [] = this.wireGetVerts(wire_i); // avoids duplicate verts
                for (const vert_i of wire_verts_i) { verts_i.push(vert_i); }
            }
            return verts_i;
        } else if (isPoint(ent_type)) {
            return  [this.navPointToVert(index)];
        } else if (isPline(ent_type)) {
            const wire_i: number = this.navPlineToWire(index);
            return this.navAnyToVert(EEntType.WIRE, wire_i);
        } else if (isPgon(ent_type)) {
            const face_i: number = this.navPgonToFace(index);
            return this.navAnyToVert(EEntType.FACE, face_i);
        } else if (isColl(ent_type)) {
            const all_verts_i: number[] = [];
            const points_i: number[] = this.navCollToPoint(index);
            for (const point_i of points_i) {
                const vert_i: number = this.navPointToVert(point_i);
                all_verts_i.push(vert_i);
            }
            const plines_i: number[] = this.navCollToPline(index);
            for (const pline_i of plines_i) {
                const verts_i: number[] = this.navAnyToVert(EEntType.PLINE, pline_i);
                for (const vert_i of verts_i) {
                    all_verts_i.push(vert_i);
                }
            }
            const pgons_i: number[] = this.navCollToPgon(index);
            for (const pgon_i of pgons_i) {
                const verts_i: number[] = this.navAnyToVert(EEntType.PGON, pgon_i);
                for (const vert_i of verts_i) {
                    all_verts_i.push(vert_i);
                }
            }
            return all_verts_i;
        }
        throw new Error('Bad navigation in geometry data structure: ' + ent_type + index);
    }
    /**
     * Navigate from any level to the triangles
     * @param ent_type
     * @param index
     */
    public navAnyToTri(ent_type: EEntType, index: number): number[] {
        if (isPosi(ent_type)) {
            const verts_i: number[] = this.navPosiToVert(index);
            return [].concat(...verts_i.map(vert_i => this.navVertToTri(vert_i)));
        } else if (isVert(ent_type)) {
            return this.navVertToTri(index);
        } else if (isTri(ent_type)) {
            return [index];
        } else if (isEdge(ent_type)) {
            return [];
        } else if (isWire(ent_type)) {
            return [];
        } else if (isFace(ent_type)) {
            return this.navFaceToTri(index);
        } else if (isPoint(ent_type)) {
            return [];
        } else if (isPline(ent_type)) {
            return [];
        } else if (isPgon(ent_type)) {
            const face_i: number = this.navPgonToFace(index);
            return this.navFaceToTri(face_i);
        } else if (isColl(ent_type)) {
            const all_tris_i: number[] = [];
            const pgons_i: number[] = this.navCollToPgon(index);
            for (const pgon_i of pgons_i) {
                const tris_i: number[] = this.navAnyToTri(EEntType.PGON, pgon_i);
                for (const tri_i of tris_i) {
                    all_tris_i.push(tri_i);
                }
            }
            return all_tris_i;
        }
        throw new Error('Bad navigation in geometry data structure: ' + ent_type + index);
    }
    /**
     * Navigate from any level to the positions
     * @param ent_type
     * @param index
     */
    public navAnyToPosi(ent_type: EEntType, index: number): number[] {
        switch (ent_type) {
            case EEntType.POSI:
                return [index];
            case EEntType.VERT:
                return [this.getVertPosi(index)];
            case EEntType.EDGE:
                return this.getEdgePosis(index);
            case EEntType.WIRE:
                return this.getWirePosis(index);
            case EEntType.TRI:
                return this.getTriPosis(index);
            case EEntType.FACE:
                return this.getFacePosis(index);
            case EEntType.POINT:
                return [this.getPointPosi(index)];
            case EEntType.PLINE:
                return this.getPlinePosis(index);
            case EEntType.PGON:
                return this.getPgonPosis(index);
            case EEntType.COLL:
                return this.getCollPosis(index);
            default:
                throw new Error();
        }
        // the old method
        // if (isPosi(ent_type)) { return [index]; }
        // const verts_i: number[] = this.navAnyToVert(ent_type, index);
        // const posis_i: number[] = verts_i.map(vert_i => this.navVertToPosi(vert_i));
        // return Array.from(new Set(posis_i)); // remove duplicates
    }
    // ============================================================================
    // Get posis
    // ============================================================================
    private getVertPosi(vert_i: number): number {
        return this._geom_arrays.dn_verts_posis[vert_i];
    }
    private getEdgePosis(edge_i: number): number[] {
        const verts_i: number[] = this._geom_arrays.dn_edges_verts[edge_i];
        return [
            this._geom_arrays.dn_verts_posis[verts_i[0]],
            this._geom_arrays.dn_verts_posis[verts_i[1]]
        ];
    }
    private getWirePosis(wire_i: number): number[] {
        const verts_i: number[] = this.wireGetVerts(wire_i);
        const posis_i: number[] = [];
        for (const vert_i of verts_i) {
            posis_i.push( this._geom_arrays.dn_verts_posis[vert_i] );
        }
        return posis_i;
    }
    private getTriPosis(tri_i: number): number[] {
        const verts_i: number[] = this._geom_arrays.dn_tris_verts[tri_i];
        const posis_i: number[] = [];
        for (const vert_i of verts_i) {
            posis_i.push( this._geom_arrays.dn_verts_posis[vert_i] );
        }
        return posis_i;
    }
    private getFacePosis(face_i: number): number[] {
        const set_posis_i: Set<number> = new Set();
        for (const wire_i of this._geom_arrays.dn_faces_wirestris[face_i][0]) {
            this.getWirePosis(wire_i).forEach(posi_i => set_posis_i.add(posi_i));
        }
        return Array.from(set_posis_i);
    }
    private getPointPosi(point_i: number): number {
        return this._geom_arrays.dn_verts_posis[
            this._geom_arrays.dn_points_verts[point_i]
        ];
    }
    private getPlinePosis(pline_i: number): number[] {
        return this.getWirePosis(this._geom_arrays.dn_plines_wires[pline_i]);
    }
    private getPgonPosis(pgon_i: number): number[] {
        return this.getFacePosis(this._geom_arrays.dn_pgons_faces[pgon_i]);
    }
    private getCollPosis(coll_i: number): number[] {
        const set_posis_i: Set<number> = new Set();
        const coll: TColl = this._geom_arrays.dn_colls_objs[coll_i];
        for (const point_i of coll[1]) {
            set_posis_i.add(this.getPointPosi(point_i));
        }
        for (const pline_i of coll[2]) {
            this.getPlinePosis(pline_i).forEach(posi_i => set_posis_i.add(posi_i));
        }
        for (const pgon_i of coll[3]) {
            this.getPgonPosis(pgon_i).forEach(posi_i => set_posis_i.add(posi_i));
        }
        return Array.from(set_posis_i);
    }
    // ============================================================================
    // Navigate from any to any, general method
    // ============================================================================
    /**
     * Navigate from any level down to the positions
     * @param index
     */
    public navAnyToAny(from_ets: EEntType, to_ets: EEntType, index: number): number[] {
        // same level
        if (from_ets === to_ets) { return [index]; }
        // from -> to
        switch (to_ets) {
            case EEntType.POSI:
                return this.navAnyToPosi(from_ets, index);
            case EEntType.VERT:
                return this.navAnyToVert(from_ets, index);
            case EEntType.EDGE:
                return this.navAnyToEdge(from_ets, index);
            case EEntType.WIRE:
                return this.navAnyToWire(from_ets, index);
            case EEntType.FACE:
                return this.navAnyToFace(from_ets, index);
            case EEntType.POINT:
                return this.navAnyToPoint(from_ets, index);
            case EEntType.PLINE:
                return this.navAnyToPline(from_ets, index);
            case EEntType.PGON:
                return this.navAnyToPgon(from_ets, index);
            case EEntType.COLL:
                return this.navAnyToColl(from_ets, index);
            default:
                throw new Error('Bad navigation in geometry data structure: ' + to_ets + index);
        }
    }
    // ============================================================================
    // ============================================================================
    // ============================================================================
    // ============================================================================
    // ============================================================================
    // ============================================================================
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
        if (isPosi(ent_type)) {
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
                if (posi !== null) {
                    if (posi.length === 0) { posis_i.push(i); }
                } else {
                    posis_i.push(null);
                }
            }
        } else {
            for (let i = 0; i < posis.length; i++ ) {
                const posi = posis[i];
                if (posi !== null) {
                    if (posi.length === 0) { posis_i.push(i); }
                }
            }
        }
        return posis_i;
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
     * Add entities to a collection
     */
    public collAddColl(coll0_i: number, coll1_i: number): void {
        this._geom_arrays.dn_colls_objs[coll1_i][0] = coll0_i;
    }
    /**
     * Remove entities from a collection
     */
    public collRemovePoint(coll_i: number, point_i: number): void {
        if (this._geom_arrays.dn_colls_objs[coll_i] == null) { return; } // deleted
        this._remFromSet(this._geom_arrays.dn_colls_objs[coll_i], 1, point_i, false);
        this._remFromSet(this._geom_arrays.up_points_colls, point_i, coll_i, true);
    }
    /**
     * Remove entities from a collection
     */
    public collRemovePline(coll_i: number, pline_i: number): void {
        if (this._geom_arrays.dn_colls_objs[coll_i] == null) { return; } // deleted
        this._remFromSet(this._geom_arrays.dn_colls_objs[coll_i], 2, pline_i, false);
        this._remFromSet(this._geom_arrays.up_plines_colls, pline_i, coll_i, true);
    }
    /**
     * Remove entities from a collection
     */
    public collRemovePgon(coll_i: number, pgon_i: number): void {
        if (this._geom_arrays.dn_colls_objs[coll_i] == null) { return; } // deleted
        this._remFromSet(this._geom_arrays.dn_colls_objs[coll_i], 3, pgon_i, false);
        this._remFromSet(this._geom_arrays.up_pgons_colls, pgon_i, coll_i, true);
    }
    /**
     * Remove entities from a collection
     */
    public collRemoveColl(coll0_i: number, coll1_i: number): void {
        if (this._geom_arrays.dn_colls_objs[coll0_i] == null) { return; } // deleted
        if (this._geom_arrays.dn_colls_objs[coll1_i][0] === coll0_i) {
            this._geom_arrays.dn_colls_objs[coll1_i][0] = -1;
        }
    }
    /**
     * Get the parent of a collection.
     * @param coll_i
     */
    public collGetParent(coll_i: number): number {
        return this._geom_arrays.dn_colls_objs[coll_i][0];
    }
    /**
     * Set the parent of a collection
     * @param coll_i The index of teh collection that is the parent
     * @param parent_coll_i
     */
    public collSetParent(coll_i: number, parent_coll_i: number): void {
        this._geom_arrays.dn_colls_objs[coll_i][0] = parent_coll_i;
    }
    /**
     * Get the children collections of a collection.
     * @param coll_i
     */
    public collGetChildren(coll_i: number): number[] {
        const children: number[] = [];
        for (let i = 0; i < this._geom_arrays.dn_colls_objs.length; i++) {
            const coll: TColl = this._geom_arrays.dn_colls_objs[i];
            if (coll !== null && coll[0] === coll_i) {
                children.push(i);
            }
        }
        return children;
    }
    /**
     * Get the ancestor collections of a collection.
     * @param coll_i
     */
    public collGetAncestors(coll_i: number): number[] {
        const ancestor_colls_i: number[] = [];
        let parent_coll_i: number = this._geom_arrays.dn_colls_objs[coll_i][0];
        while (parent_coll_i !== -1) {
            ancestor_colls_i.push(parent_coll_i);
            parent_coll_i = this._geom_arrays.dn_colls_objs[parent_coll_i][0];
        }
        return ancestor_colls_i;
    }
    /**
     * Get the descendent collections of a collection.
     * @param coll_i
     */
    public collGetDescendents(coll_i: number): number[] {
        const descendent_colls_i: number[] = [];
        for (let i = 0; i < this._geom_arrays.dn_colls_objs.length; i++) {
            const coll: TColl = this._geom_arrays.dn_colls_objs[i];
            if (coll !== null && coll[0] !== -1) {
                if (this.isCollDescendent(i, coll_i)) {
                    descendent_colls_i.push(i);
                }
            }
        }
        return descendent_colls_i;
    }
    /**
     * Returns true if the first coll is a descendent of the second coll.
     * @param coll_i
     */
    public isCollDescendent(coll1_i: number, coll2_i: number): boolean {
        let parent_coll_i: number = this._geom_arrays.dn_colls_objs[coll1_i][0];
        while (parent_coll_i !== -1) {
            parent_coll_i = this._geom_arrays.dn_colls_objs[parent_coll_i][0];
            if (parent_coll_i === coll2_i) { return true; }
        }
        return false;
    }
    /**
     * Returns true if the first coll is an ancestor of the second coll.
     * @param coll_i
     */
    public isCollAncestor(coll1_i: number, coll2_i: number): boolean {
        let parent_coll_i: number = this._geom_arrays.dn_colls_objs[coll2_i][0];
        while (parent_coll_i !== -1) {
            parent_coll_i = this._geom_arrays.dn_colls_objs[parent_coll_i][0];
            if (parent_coll_i === coll1_i) { return true; }
        }
        return false;
    }

    // ============================================================================
    // Faces
    // ============================================================================
    /**
     *
     * @param face_i
     */
    public getFaceBoundary(face_i: number): number {
        const wires_i: number[] = this._geom_arrays.dn_faces_wirestris[face_i][0];
        return wires_i[0];
    }
    /**
     *
     * @param face_i
     */
    public getFaceHoles(face_i: number): number[] {
        const wires_i: number[] = this._geom_arrays.dn_faces_wirestris[face_i][0];
        return wires_i.slice(1);
    }
    // ============================================================================
    // IS / HAS ??? methods, return true/false
    // ============================================================================

    public vertIsPline(vert_i: number): boolean {
        const edges_i: number[] = this._geom_arrays.up_verts_edges[vert_i];
        const edge_i: number = edges_i[0] !== undefined ? edges_i[0] : edges_i[1];
        if (edge_i === undefined) { return false; }
        return this._geom_arrays.up_wires_plines[this._geom_arrays.up_edges_wires[edge_i]] !== undefined;
    }
    public vertIsPgon(vert_i: number): boolean {
        const edges_i: number[] = this._geom_arrays.up_verts_edges[vert_i];
        const edge_i: number = edges_i[0] !== undefined ? edges_i[0] : edges_i[1];
        if (edge_i === undefined) { return false; }
        return this._geom_arrays.up_wires_faces[this._geom_arrays.up_edges_wires[edge_i]] !== undefined;
    }
    public vertIsEdge(vert_i: number): boolean {
        return this._geom_arrays.up_verts_edges[vert_i] !== undefined;
    }
    public vertIsPoint(vert_i: number): boolean {
        return this._geom_arrays.up_verts_points[vert_i] !== undefined;
    }
    public pgonHasHoles(pgon_i: number): boolean {
        return this._geom_arrays.dn_faces_wirestris[
            this._geom_arrays.dn_pgons_faces[pgon_i]
        ][0].length > 1;
    }
    // ============================================================================
    // Wires
    // ============================================================================
    public wireIsFace(wire_i: number): boolean {
        return this._geom_arrays.up_wires_plines[wire_i] === undefined;
    }
    public wireIsPline(wire_i: number): boolean {
        return this._geom_arrays.up_wires_plines[wire_i] !== undefined;
    }
    public wireIsHole(wire_i: number): boolean {
        const face_i: number = this._geom_arrays.up_wires_faces[wire_i];
        if (face_i === undefined) { return false; }
        const face: TFace = this._geom_arrays.dn_faces_wirestris[face_i];
        return face[0].indexOf(wire_i) > 0;
    }
    /**
     * Check if a wire is closed.
     * @param wire_i
     */
    public wireIsClosed(wire_i: number): boolean {
        const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
        return this._geom_arrays.dn_edges_verts[wire[0]][0] !== undefined;
        // const start_vert_i: number = this._geom_arrays.dn_edges_verts[wire[0]][0];
        // if (start_vert_i === undefined) { return false; }
        // const end_vert_i: number =   this._geom_arrays.dn_edges_verts[wire[wire.length - 1]][1];
        // if (start_vert_i === undefined) { return false; }
        // return (start_vert_i === end_vert_i);
    }
    public wireIsOpen(wire_i: number): boolean {
        return !this.wireIsClosed(wire_i);
    }
    /**
     * Returns the vertices along a wire
     */
    public wireGetVerts(wire_i: number): number[] {
        const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
        for (const edge_i of edges_i) {
        }
        if (this.wireIsClosed(wire_i)) {
            return edges_i.map(edge_i => this._geom_arrays.dn_edges_verts[edge_i][0]);
        } else {
            const verts_i: number[] = [];
            for (let i = 0; i < edges_i.length - 1; i++) {
                verts_i.push( this._geom_arrays.dn_edges_verts[edges_i[i]][1] );
            }
            verts_i.push( this._geom_arrays.dn_edges_verts[edges_i[edges_i.length - 1]][0] );
            return verts_i;
        }
    }
    // /**
    //  * Check if a wire belongs to a pline, a pgon or a pgon hole.
    //  */
    // public wireGetType(wire_i: number): EWireType {
    //     // get the wire start and end verts
    //     const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
    //     if (this.navWireToPline(wire_i) !== undefined) {
    //         return EWireType.PLINE;
    //     }
    //     const face_i: number = this.navWireToFace(wire_i);
    //     const face: TFace = this._geom_arrays.dn_faces_wirestris[face_i];
    //     const index: number = face[0].indexOf(wire_i);
    //     if (index === 0) { return EWireType.PGON; }
    //     if (index > 0) { return EWireType.PGON_HOLE; }
    //     throw new Error('Inconsistencies found in the internal data structure.');
    // }
    /**
     * Replace edges in a wire with new edges.
     *
     * If the wire is closed, then the list of edges may wrap.
     *
     * TODO This turns out to be a messm bacause the old and new edges create an inconsistent state
     */
    // public wireReplaceEdges(wire_i: number,  old_edges_i: number[], new_edges_i: number[]): void {
    //     const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
    //     // run some checks
    //     for (let i = 0; i < new_edges_i.length; i++) {
    //         if (i !== 0) {
    //             if (
    //                 this._geom_arrays.dn_edges_verts[new_edges_i[i - 1]][1] !==
    //                 this._geom_arrays.dn_edges_verts[new_edges_i[i]][0]
    //             ) { throw new Error('Error replacing edges: New edges are not in sequence.'); }
    //         }
    //         if (edges_i.indexOf(new_edges_i[i]) !== -1) { throw new Error('Error replacing edges: \
    //             The wire already contains one of the new edges.'); }
    //     }
    //     let start_idx: number = null;
    //     let end_idx: number = null;
    //     for (let i = 0; i < old_edges_i.length; i++) {
    //         if (i !== 0) {
    //             if (
    //                 this._geom_arrays.dn_edges_verts[old_edges_i[i - 1]][1] !==
    //                 this._geom_arrays.dn_edges_verts[old_edges_i[i]][0]
    //             ) { throw new Error('Error replacing edges: Old edges are not in sequence.'); }
    //         }
    //         const idx: number = edges_i.indexOf(old_edges_i[i]);
    //         if (idx === -1) { throw new Error('Error replacing edges: \
    //             The wire does not contain one of the old edges.'); }
    //         if (i = 0) { start_idx = idx; }
    //         if (i = old_edges_i.length - 1) { end_idx = idx; }
    //      }
    //     // get the start and end indexes
    //     const is_closed: boolean = this.wireIsClosed(wire_i);
    //     // check if this wraps
    //     let wrap = false;
    //     if (start_idx > end_idx) { wrap = true; }
    //     if (!is_closed && wrap) { throw new Error('Start edge comes after the end edge.'); }
    //     // wire the old edges to the new vertices
    //     const keep_edge0_i: number = this.wireGetPrevEdge(wire_i, old_edges_i[0]);
    //     const rewire_vert0_i: number = this._geom_arrays.dn_edges_verts[keep_edge0_i][1];
    //     this._insToArr(this._geom_arrays.up_verts_edges, rewire_vert0_i, new_edges_i[0], 1);
    //     const keep_edge1_i: number = this.wireGetNextEdge(wire_i, old_edges_i[old_edges_i.length - 1]);
    //     const rewire_vert1_i: number = this._geom_arrays.dn_edges_verts[keep_edge1_i][0];
    //     this._insToArr(this._geom_arrays.up_verts_edges, rewire_vert1_i, new_edges_i[new_edges_i.length - 1], 0);
    //     // make the new edges point up to this wire
    //     for (const edge_i of old_edges_i) {
    //         this._set(this._geom_arrays.up_edges_wires, edge_i, wire_i);
    //     }
    //     // splice in the new edges into the wire
    //     if (!wrap) {
    //         this._geom_arrays.dn_wires_edges[wire_i].splice(start_idx, old_edges_i.length, ...new_edges_i);
    //     } else {
    //         const updated_edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i].slice(end_idx + 1, start_idx);
    //         for (const edge_i of new_edges_i) {
    //             updated_edges_i.push(edge_i);
    //         }
    //         this._geom_arrays.dn_wires_edges[wire_i] = updated_edges_i;
    //     }
    //     // delete all the old edges and verts
    //     for (const edge_i of old_edges_i) {
    //         // edge
    //         this._clear(this._geom_arrays.up_edges_wires, edge_i, true);
    //         const verts_i: number[] = this.remEdgeEnt(edge_i);
    //         // two verts
    //         this.remVertEnt(verts_i[0]);
    //         this.remVertEnt(verts_i[1]);
    //     }
    // }
    /**
     * Gets the next edge in a wire.
     *
     * If the wire is open, and we are at the last wdge, return null.
     *
     * If the wire is closed and we are at the last edge, return the first edge.
     */
    public wireGetNextEdge(wire_i: number, edge_i: number): number {
        const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
        const idx_edge: number = edges_i.indexOf(edge_i);
        if (idx_edge === -1) { throw new Error('Error finding next edge. The edge is not in the wire.'); }
        if (idx_edge < edges_i.length - 1) { return edges_i[idx_edge + 1]; }
        if (idx_edge === edges_i.length - 1 && this.wireIsClosed(wire_i)) { return edges_i[0]; }
        return null;
    }
        /**
     * Gets the prev edge in a wire.
     *
     * If the wire is open, and we are at the first edge, return null.
     *
     * If the wire is closed and we are at the first edge, return the last edge.
     */
    public wireGetPrevEdge(wire_i: number, edge_i: number): number {
        const edges_i: number[] = this._geom_arrays.dn_wires_edges[wire_i];
        const idx_edge: number = edges_i.indexOf(edge_i);
        if (idx_edge === -1) { throw new Error('Error finding prev edge. The edge is not in the wire.'); }
        if (idx_edge > 0) { return edges_i[idx_edge - 1]; }
        if (idx_edge === 0 && this.wireIsClosed(wire_i)) { return edges_i[edges_i.length - 1]; }
        return null;
    }
    /**
     * Gets the next vert in a wire.
     *
     * If the wire is open, and we are at the last vert, return null.
     *
     * If the wire is closed and we are at the last vert, return the first vert.
     */
    public wireGetNextVert(wire_i: number, vert_i: number): number {
        const verts_i: number[] = this.wireGetVerts(wire_i);
        const idx_vert: number = verts_i.indexOf(vert_i);
        if (idx_vert === -1) { throw new Error('Error finding next vert. The vert is not in the wire.'); }
        if (idx_vert < verts_i.length - 1) { return verts_i[idx_vert + 1]; }
        if (idx_vert === verts_i.length - 1 && this.wireIsClosed(wire_i)) { return verts_i[0]; }
        return null;
    }
    /**
     * Gets the prev vert in a wire.
     *
     * If the wire is open, and we are at the first vert, return null.
     *
     * If the wire is closed and we are at the first vert, return the last vert.
     */
    public wireGetPrevVert(wire_i: number, vert_i: number): number {
        const verts_i: number[] = this.wireGetVerts(wire_i);
        const idx_vert: number = verts_i.indexOf(vert_i);
        if (idx_vert === -1) { throw new Error('Error finding prev vert. The vert is not in the wire.'); }
        if (idx_vert > 0) { return verts_i[idx_vert - 1]; }
        if (idx_vert === 0 && this.wireIsClosed(wire_i)) { return verts_i[verts_i.length - 1]; }
        return null;
    }
    /**
     * Shifts the edges of a wire.
     * ~
     * The attributes will not be affected. For example, lets say a polygon has three edges
     * e1, e2, e3, with attribute values 5, 6, 7
     * If teh edges are shifted by 1, the edges will now be
     * e2, e3, e1, withh attribute values 6, 7, 5
     */
    public wireShift(wire_i: number, offset: number): void {
        const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
        wire.unshift.apply( wire, wire.splice( offset, wire.length ) );
    }
    // ============================================================================
    // Reverse
    // ============================================================================
    /**
     * Reverse an edge
     */
    public edgeReverse(edge_i: number): void {
        const edge: TEdge = this._geom_arrays.dn_edges_verts[edge_i];
        edge.reverse();
        // the verts pointing up to edges also need to be reversed
        const edges_i: number[] = this._geom_arrays.up_verts_edges[edge[0]];
        edges_i.reverse();
    }
    /**
     * Reverse a wire
     */
    public wireReverse(wire_i: number): void {
        const wire: TWire = this._geom_arrays.dn_wires_edges[wire_i];
        wire.reverse();
        // reverse the edges
        for (const edge_i of wire) {
            this.edgeReverse(edge_i);
        }
    }
    /**
     * Reverse a face
     */
    public faceReverse(face_i: number): void {
        const face: TFace = this._geom_arrays.dn_faces_wirestris[face_i];
        // reverse the edges
        for (const wire_i of face[0]) {
            this.wireReverse(wire_i);
        }
        // reverse the triangles
        for (const tri_i of face[1]) {
            const tri: TTri = this._geom_arrays.dn_tris_verts[tri_i];
            tri.reverse();
        }
    }
    // ============================================================================
    // Triangulate a face
    // ============================================================================
    /**
     * Triangulate a polygon.
     *
     * The input polygon may not have any triangles.
     */
    public faceTri(face_i: number): void {
        const wirestris: TFace = this._geom_arrays.dn_faces_wirestris[face_i];
        const outer_i: number = wirestris[0][0];
        const holes_i: number[] = wirestris[0].slice(1);
        // create the triangles
        const new_face_tris_i: number[] = this._createTris(outer_i, holes_i);
        // delete the old trianges
        const old_face_tris_i: number[] = wirestris[1]; // if this is a new pgon, this is empty
        for (const old_face_tri_i of old_face_tris_i) {
            this.remTriEnt(old_face_tri_i);
            this.unlinkFaceTri(face_i, old_face_tri_i);
        }
        for (const new_face_tri_i of new_face_tris_i) {
            this.linkFaceTri(face_i, new_face_tri_i);
        }
    }
    /**
     * Adds a hole to a face and updates the arrays.
     * Wires are assumed to be closed!
     * This also calls addTris()
     * TODO  - remove this method
     */
    public faceCutHoles(face_i: number, hole_wires_i: number[]): number {
        // get the wires and triangles arrays
        const [face_wires_i, old_face_tris_i]: [number[], number[]] = this._geom_arrays.dn_faces_wirestris[face_i];
        // get the outer wire
        const outer_wire_i: number = face_wires_i[0];
        // get the hole wires
        const all_hole_wires_i: number[] = [];
        if (face_wires_i.length > 1) {
            face_wires_i.slice(1).forEach(wire_i => all_hole_wires_i.push(wire_i));
        }
        hole_wires_i.forEach(wire_i => all_hole_wires_i.push(wire_i));
        // create the triangles
        const new_tris_i: number[] = this._createTris(outer_wire_i, all_hole_wires_i);
        // create the face
        const new_wires_i: number[] = face_wires_i.concat(hole_wires_i);
        const new_face: TFace = [new_wires_i, new_tris_i];
        // update down arrays
        this._geom_arrays.dn_faces_wirestris[face_i] = new_face;
        // update up arrays
        hole_wires_i.forEach(hole_wire_i => this._geom_arrays.up_wires_faces[hole_wire_i] = face_i);
        new_tris_i.forEach( tri_i => this._geom_arrays.up_tris_faces[tri_i] = face_i );
        // delete the old trianges
        for (const old_face_tri_i of old_face_tris_i) {
            // remove these deleted tris from the verts
            for (const vertex_i of this._geom_arrays.dn_tris_verts[old_face_tri_i]) {
                this._remFromSet( this._geom_arrays.up_verts_tris, vertex_i, old_face_tri_i, true);
            }
            // tris to verts
            this._clear(this._geom_arrays.dn_tris_verts, old_face_tri_i, false);
            // tris to faces
            this._clear( this._geom_arrays.up_tris_faces, old_face_tri_i, false );
        }
        // return the numeric index of the face
        return face_i;
    }
    /**
     * Adds trangles and updates the arrays.
     * Wires are assumed to be closed!
     * This updates the trie->verts and the verts->tris
     * This does not update the face to which this wire belongs!
     * @param wire_i
     */
    private _createTris(wire_i: number, hole_wires_i?: number[]): number[] {
        // save all verts
        const all_verts_i: number[] = [];
        // get the coords of the outer perimeter edge
        const wire_verts_i: number[] = this.wireGetVerts(wire_i);
        const wire_xyzs: Txyz[] = [];
        for (const vert_i of wire_verts_i) {
            all_verts_i.push(vert_i);
            wire_xyzs.push( this.geom.model.attribs.query.getVertCoords(vert_i) );
        }
        // get the coords of the holes
        const all_hole_coords: Txyz[][] = [];
        if (hole_wires_i !== undefined) {
            for (const hole_wire_i of hole_wires_i) {
                const hole_verts_i: number[] = this.wireGetVerts(hole_wire_i);
                const hole_xyzs: Txyz[] = [];
                for (const vert_i of hole_verts_i) {
                    all_verts_i.push(vert_i);
                    hole_xyzs.push( this.geom.model.attribs.query.getVertCoords(vert_i) );
                }
                all_hole_coords.push(hole_xyzs);
            }
        }
        // create the triangles using earcut
        const tris_corners: number[][] = triangulate(wire_xyzs, all_hole_coords);
        const tris: TTri[] = tris_corners.map(tri_corners => tri_corners.map( corner => all_verts_i[corner] ) as TTri );
        // create the tris
        const tris_i: number[] = [];
        for (const tri of tris) {
            tris_i.push( this.addTriEnt(tri) );
        }
        // return an array of numeric indices of the triangles
        return tris_i;
    }
    /**
     * Make a pretty string out of an entity tree.
     */
    public entGetPrettyStr(ent_type: EEntType, ent_i: number): string {
        const tree: TTree = this.entEntTree(ent_type, ent_i);
        console.log(tree);
        // ---
        function _pretty(_tree: any[], _indent: number) {
            let _str = '';
            if (Array.isArray(_tree[0])) {
                for (const _item of _tree) {
                    _str += _pretty( _item, _indent);
                }
                return _str;
            }
            const _indent_str = '\n' + ' '.repeat(_indent * 2) + '|';
            _str += _indent_str + EEntType[_tree[0]] + ' ' + EEntTypeStr[_tree[0]] + _tree[1] + ':';
            for (const _tree2 of _tree.slice(2)) {
                if (Array.isArray(_tree2)) {
                    _str += _pretty( _tree2, _indent + 1);
                } else {
                    if (_tree2 !== '') {
                        _str += _indent_str + String(_tree2);
                    }
                }
            }
            return _str;
        }
        // ---
        console.log(JSON.stringify(tree));
        return _pretty(tree, 0);
    }
}
