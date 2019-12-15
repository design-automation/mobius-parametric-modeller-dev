import { EEntType, IGeomArrays, TFace, TColl, IEntPack, TEntTypeIdx, IGeomPack, IObjPack, TCollPoints, TCollPlines, TCollPgons } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Creating ObjPacks and GeomPacks
 *
 */
export class GeomPack extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
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
        const wires_i: number[] = this._geom_arrays.dn_faces_wires[face_i].slice(); // dup
        const tris_i: number[] = this._geom_arrays.dn_faces_tris[face_i].slice(); // dup
        const edges_i: number[] = [];
        const verts_i: number[] = [];
        const posis_i: number[] = [];
        for (const wire_i of wires_i) { // ignore the tris
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
        const coll_points: TCollPoints = this._geom_arrays.dn_colls_points[coll_i];
        const coll_plines: TCollPlines = this._geom_arrays.dn_colls_plines[coll_i];
        const coll_pgons: TCollPgons = this._geom_arrays.dn_colls_pgons[coll_i];
        // objects
        coll_points.forEach( point_i => ent_packs.push( this.getPointEntPack(point_i)) );
        coll_plines.forEach( pline_i => ent_packs.push( this.getPlineEntPack(pline_i)) );
        coll_pgons.forEach( pgon_i =>  ent_packs.push( this.getPgonEntPack(pgon_i)) );
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
    public getCollObjPack(coll_i: number): IObjPack {
        const set_colls_i: Set<number> = new Set();
        const set_pgons_i: Set<number> = new Set();
        const set_plines_i: Set<number> = new Set();
        const set_points_i: Set<number> = new Set();
        // get all the descendents of this collection
        set_colls_i.add(coll_i);
        for (const desc_coll_i of this.collGetDescendents(coll_i)) {
            set_colls_i.add(desc_coll_i);
        }
        // get all the objs
        for (const pgon_i of this.navCollToPgon(coll_i)) { // Calls collGetDescendents()
            set_pgons_i.add(pgon_i);
        }
        for (const pline_i of this.navCollToPline(coll_i)) { // Calls collGetDescendents()
            set_plines_i.add(pline_i);
        }
        for (const point_i of this.navCollToPoint(coll_i)) { // Calls collGetDescendents()
            set_points_i.add(point_i);
        }
        // return the obj pack
        return {
            points_i: Array.from(set_points_i),
            plines_i: Array.from(set_plines_i),
            pgons_i: Array.from(set_pgons_i),
            colls_i: Array.from(set_colls_i)
        };
    }
    /**
     * Returns a geom pack of unique indexes, given an array of TEntTypeIdx.
     *
     * Include objs and colls, and positions.
     */
    public getGeomPackFromEnts(ents: TEntTypeIdx[], invert: boolean = false): IGeomPack {
        // utility functions
        function _addToSet(_set: Set<number>, _ents_i: number[]): void {
            _ents_i.forEach( num => _set.add(num) );
        }
        // ---------------------------------------
        // the other sets for the geom pack
        const set_points_i: Set<number> = new Set();
        const set_plines_i: Set<number> = new Set();
        const set_pgons_i: Set<number> = new Set();
        const set_colls_i: Set<number> = new Set();
        const set_posis_i: Set<number> = new Set();
        // put ents into sets
        for (const ent_arr of ents) {
            const [ent_type, index]: TEntTypeIdx = ent_arr as TEntTypeIdx;
            // add ents
            if (ent_type === EEntType.COLL) {
                set_colls_i.add(index);
                const coll_gp: IObjPack = this.getCollObjPack(index);
                _addToSet(set_points_i, coll_gp.points_i);
                _addToSet(set_plines_i, coll_gp.plines_i);
                _addToSet(set_pgons_i,  coll_gp.pgons_i);
                _addToSet(set_colls_i,  coll_gp.colls_i);
            } else if (ent_type === EEntType.PGON) {
                set_pgons_i.add(index);
            } else if (ent_type === EEntType.PLINE) {
                set_plines_i.add(index);
            } else if (ent_type === EEntType.POINT) {
                set_points_i.add(index);
            } else if (ent_type === EEntType.POSI) {
                set_points_i.add(index);
            }
        }
        // return the arrays, do not invert
        return {
            points_i: Array.from(set_points_i),
            plines_i: Array.from(set_plines_i),
            pgons_i: Array.from(set_pgons_i),
            colls_i: Array.from(set_colls_i),
            posis_i: Array.from(set_posis_i),
        };
    }
    /**
     * Inverts a obj pack, returns unique indexes
     *
     * Include objs and colls, but no positions.
     */
    public invertObjPack(pack: IObjPack|IGeomPack): IObjPack {
        // utility functions
        function _invSet(_ents: any[], _ga: any[]): any[] {
            const _set_ents: Set<number> = new Set(_ents);
            const _set_inv_ents: Set<number> = new Set();
            let i = 0; const max = _ga.length;
            for (; i < max; i++) {
                if (_ga[i] !== undefined && !_set_ents.has(i)) {
                    _set_inv_ents.add(i);
                }
            }
            return Array.from(_set_inv_ents);
        }
        // ---------------------------------------
        // return the arrays, invert
        return {
            points_i: _invSet(pack.points_i, this._geom_arrays.dn_points_verts),
            plines_i: _invSet(pack.plines_i, this._geom_arrays.dn_plines_wires),
            pgons_i:  _invSet(pack.pgons_i,  this._geom_arrays.dn_pgons_faces),
            colls_i:  _invSet(pack.colls_i,  this._geom_arrays.up_colls_parents)
        };
    }
}
