import { IGeomArrays, EEntType, TEntTypeIdx, TId, EEntTypeStr } from './common';
import { GIGeom } from './GIGeom';
import { getArrDepth2 } from '../util/arrs';

/**
 * Class for geometry IDs.
 */
export class GIGeomID {
    private _geom: GIGeom;
    private _geom_arrays: IGeomArrays;
    /**
     * Constructor
     */
    constructor(geom: GIGeom, geom_arrays: IGeomArrays) {
        this._geom = geom;
        this._geom_arrays = geom_arrays;
    }
    /**
     * Get the ID from an index, or a list of indexes
     * @param idx
     */
    public getID(ent_type: EEntType, idx: number|number[]|number[][]): TId|TId[]|TId[][] {
        if (!Array.isArray(idx)) {
            switch (ent_type) {
                case EEntType.POSI:
                    return this.posiID(idx);
                case EEntType.VERT:
                    return this.vertID(idx);
                case EEntType.EDGE:
                    return this.edgeID(idx);
                case EEntType.WIRE:
                    return this.wireID(idx);
                case EEntType.FACE:
                    return this.faceID(idx);
                case EEntType.POINT:
                    return this.pointID(idx);
                case EEntType.PLINE:
                    return this.plineID(idx);
                case EEntType.PGON:
                    return this.pgonID(idx);
                case EEntType.COLL:
                    return this.collID(idx);
                default:
                    break;
            }
        } else {
            return (idx as number[]).map( a_idx => this.getID(ent_type, a_idx)) as string[];
        }
    }
    /**
     * Get the ID from [ent_type, ent_i], or a list of [ent_type, ent_i]
     * @param idx
     */
    public getIDFromTypeIdx(type_idx: TEntTypeIdx|TEntTypeIdx[]|TEntTypeIdx[][]): TId|TId[]|TId[][] {
        if (getArrDepth2(type_idx) === 1) {
            const [ent_type, ent_i]: TEntTypeIdx = type_idx as TEntTypeIdx;
            switch (ent_type) {
                case EEntType.POSI:
                    return this.posiID(ent_i);
                case EEntType.VERT:
                    return this.vertID(ent_i);
                case EEntType.EDGE:
                    return this.edgeID(ent_i);
                case EEntType.WIRE:
                    return this.wireID(ent_i);
                case EEntType.FACE:
                    return this.faceID(ent_i);
                case EEntType.POINT:
                    return this.pointID(ent_i);
                case EEntType.PLINE:
                    return this.plineID(ent_i);
                case EEntType.PGON:
                    return this.pgonID(ent_i);
                case EEntType.COLL:
                    return this.collID(ent_i);
                default:
                    break;
            }
        } else {
            return (type_idx as TEntTypeIdx[]).map( a_type_idx => this.getIDFromTypeIdx(a_type_idx)) as TId[];
        }
    }
    /**
     * Get the [ent_type, ent_i] from an ID, or a list of IDs
     * @param id
     */
    public getTypeIdxFromID(id: TId|TId[]|TId[][]): TEntTypeIdx|TEntTypeIdx[]|TEntTypeIdx[][]  {
        if (!Array.isArray(id)) {
            if (typeof id !== 'string') { throw new Error('Value is not an entity ID.'); }
            if (id.length < 3) { throw new Error('String is not an entity ID.'); }
            const ent_type_str: string = id.slice(0, 2);
            const ent_type: EEntType = EEntTypeStr[ent_type_str];
            switch (ent_type) {
                case EEntType.POSI:
                    return [ent_type, this.posiIdx(id)];
                case EEntType.VERT:
                    return [ent_type, this.vertIdx(id)];
                case EEntType.EDGE:
                    return [ent_type, this.edgeIdx(id)];
                case EEntType.WIRE:
                    return [ent_type, this.wireIdx(id)];
                case EEntType.FACE:
                    return [ent_type, this.faceIdx(id)];
                case EEntType.POINT:
                    return [ent_type, this.pointIdx(id)];
                case EEntType.PLINE:
                    return [ent_type, this.plineIdx(id)];
                case EEntType.PGON:
                    return [ent_type, this.pgonIdx(id)];
                case EEntType.COLL:
                    return [ent_type, this.collIdx(id)];
                default:
                    break;
            }
        } else {
            return (id as TId[]).map( a_id => this.getTypeIdxFromID(a_id)) as TEntTypeIdx[];
        }
    }
    /**
     * Get the ID from a posi index
     * @param idx
     */
    public posiID(idx: number): TId {
        return this._geom_arrays.id_maps.posiID.get(idx);
    }
    /**
     * Get the array index from a posi ID
     * @param id
     */
    public posiIdx(id: TId): number {
        return this._geom_arrays.id_maps.posiIdx.get(id);
    }
   /**
     * Try to merge a new posi ID in the ID maps.
     * @param id
     */
    public mergePosiID(idx: number, id: TId): void {
        let new_id: TId;
        if (this._geom_arrays.id_maps.posiIdx.get(id) !== undefined) {
            new_id = 'ps' + this._geom_arrays.id_counts.posis;
            this._geom_arrays.id_counts.posis += 1;
        } else {
            new_id = id;
        }
        this._geom_arrays.id_maps.posiID.set(idx, new_id);
        this._geom_arrays.id_maps.posiIdx.set(new_id, idx);
    }
    /**
     * Create a new posi ID in the ID maps.
     * @param id
     */
    public newPosiID(idx: number): void {
        const id: string = 'ps' + this._geom_arrays.id_counts.posis;
        this._geom_arrays.id_maps.posiID.set(idx, id);
        this._geom_arrays.id_maps.posiIdx.set(id, idx);
        this._geom_arrays.id_counts.posis += 1;
    }
    /**
     * Get the ID from a vert index
     * @param idx
     */
    public vertID(idx: number): TId {
        return this._geom_arrays.id_maps.vertID.get(idx);
    }
    /**
     * Get the array index from a vert ID
     * @param id
     */
    public vertIdx(id: TId): number {
        return this._geom_arrays.id_maps.vertIdx.get(id);
    }
    /**
     * Try to merge a new vert ID in the ID maps.
     * @param id
     */
    public mergeVertID(idx: number, id: TId): void {
        let new_id: TId;
        if (this._geom_arrays.id_maps.vertIdx.get(id) !== undefined) {
            new_id = '_v' + this._geom_arrays.id_counts.verts;
            this._geom_arrays.id_counts.verts += 1;
        } else {
            new_id = id;
        }
        this._geom_arrays.id_maps.vertID.set(idx, new_id);
        this._geom_arrays.id_maps.vertIdx.set(new_id, idx);
    }
    /**
     * Create a new vert ID in the ID maps.
     * @param id
     */
    public newVertID(idx: number): void {
        const id: string = '_v' + this._geom_arrays.id_counts.verts;
        this._geom_arrays.id_maps.vertID.set(idx, id);
        this._geom_arrays.id_maps.vertIdx.set(id, idx);
        this._geom_arrays.id_counts.verts += 1;
    }
    /**
     * Get the ID from a edge index
     * @param idx
     */
    public edgeID(idx: number): TId {
        return this._geom_arrays.id_maps.edgeID.get(idx);
    }
    /**
     * Get the array index from a edge ID
     * @param id
     */
    public edgeIdx(id: TId): number {
        return this._geom_arrays.id_maps.edgeIdx.get(id);
    }
    /**
     * Try to merge a new edge ID in the ID maps.
     * @param id
     */
    public mergeEdgeID(idx: number, id: TId): void {
        let new_id: TId;
        if (this._geom_arrays.id_maps.edgeIdx.get(id) !== undefined) {
            new_id = '_e' + this._geom_arrays.id_counts.edges;
            this._geom_arrays.id_counts.edges += 1;
        } else {
            new_id = id;
        }
        this._geom_arrays.id_maps.edgeID.set(idx, new_id);
        this._geom_arrays.id_maps.edgeIdx.set(new_id, idx);
    }
    /**
     * Create a new edge ID in the ID maps.
     * @param id
     */
    public newEdgeID(idx: number): void {
        const id: string = '_e' + this._geom_arrays.id_counts.edges;
        this._geom_arrays.id_maps.edgeID.set(idx, id);
        this._geom_arrays.id_maps.edgeIdx.set(id, idx);
        this._geom_arrays.id_counts.edges += 1;
    }
    /**
     * Get the ID from a wire index
     * @param idx
     */
    public wireID(idx: number): TId {
        return this._geom_arrays.id_maps.wireID.get(idx);
    }
    /**
     * Get the array index from a wire ID
     * @param id
     */
    public wireIdx(id: TId): number {
        return this._geom_arrays.id_maps.wireIdx.get(id);
    }
    /**
     * Try to merge a new wire ID in the ID maps.
     * @param id
     */
    public mergeWireID(idx: number, id: TId): void {
        let new_id: TId;
        if (this._geom_arrays.id_maps.wireIdx.get(id) !== undefined) {
            new_id = '_w' + this._geom_arrays.id_counts.wires;
            this._geom_arrays.id_counts.wires += 1;
        } else {
            new_id = id;
        }
        this._geom_arrays.id_maps.wireID.set(idx, new_id);
        this._geom_arrays.id_maps.wireIdx.set(new_id, idx);
    }
    /**
     * Create a new wire ID in the ID maps.
     * @param id
     */
    public newWireID(idx: number): void {
        const id: string = '_w' + this._geom_arrays.id_counts.wires;
        this._geom_arrays.id_maps.wireID.set(idx, id);
        this._geom_arrays.id_maps.wireIdx.set(id, idx);
        this._geom_arrays.id_counts.wires += 1;
    }
    /**
     * Get the ID from a face index
     * @param idx
     */
    public faceID(idx: number): TId {
        return this._geom_arrays.id_maps.faceID.get(idx);
    }
    /**
     * Get the array index from a face ID
     * @param id
     */
    public faceIdx(id: TId): number {
        return this._geom_arrays.id_maps.faceIdx.get(id);
    }
    /**
     * Try to merge a new face ID in the ID maps.
     * @param id
     */
    public mergeFaceID(idx: number, id: TId): void {
        let new_id: TId;
        if (this._geom_arrays.id_maps.faceIdx.get(id) !== undefined) {
            new_id = '_f' + this._geom_arrays.id_counts.faces;
            this._geom_arrays.id_counts.faces += 1;
        } else {
            new_id = id;
        }
        this._geom_arrays.id_maps.faceID.set(idx, new_id);
        this._geom_arrays.id_maps.faceIdx.set(new_id, idx);
    }
    /**
     * Create a new face ID in the ID maps.
     * @param id
     */
    public newFaceID(idx: number): void {
        const id: string = '_f' + this._geom_arrays.id_counts.faces;
        this._geom_arrays.id_maps.faceID.set(idx, id);
        this._geom_arrays.id_maps.faceIdx.set(id, idx);
        this._geom_arrays.id_counts.faces += 1;
    }
    /**
     * Get the ID from a point index
     * @param idx
     */
    public pointID(idx: number): TId {
        return this._geom_arrays.id_maps.pointID.get(idx);
    }
    /**
     * Get the array index from a point ID
     * @param id
     */
    public pointIdx(id: TId): number {
        return this._geom_arrays.id_maps.pointIdx.get(id);
    }
    /**
     * Try to merge a new point ID in the ID maps.
     * @param id
     */
    public mergePointID(idx: number, id: TId): void {
        let new_id: TId;
        if (this._geom_arrays.id_maps.pointIdx.get(id) !== undefined) {
            new_id = 'pt' + this._geom_arrays.id_counts.points;
            this._geom_arrays.id_counts.points += 1;
        } else {
            new_id = id;
        }
        this._geom_arrays.id_maps.pointID.set(idx, new_id);
        this._geom_arrays.id_maps.pointIdx.set(new_id, idx);
    }
    /**
     * Create a new point ID in the ID maps.
     * @param id
     */
    public newPointID(idx: number): void {
        const id: string = 'pt' + this._geom_arrays.id_counts.points;
        this._geom_arrays.id_maps.pointID.set(idx, id);
        this._geom_arrays.id_maps.pointIdx.set(id, idx);
        this._geom_arrays.id_counts.points += 1;
    }
    /**
     * Get the ID from a pline index
     * @param idx
     */
    public plineID(idx: number): TId {
        return this._geom_arrays.id_maps.plineID.get(idx);
    }
    /**
     * Get the array index from a pline ID
     * @param id
     */
    public plineIdx(id: TId): number {
        return this._geom_arrays.id_maps.plineIdx.get(id);
    }
    /**
     * Try to merge a new pline ID in the ID maps.
     * @param id
     */
    public mergePlineID(idx: number, id: TId): void {
        let new_id: TId;
        if (this._geom_arrays.id_maps.plineIdx.get(id) !== undefined) {
            new_id = 'pl' + this._geom_arrays.id_counts.plines;
            this._geom_arrays.id_counts.plines += 1;
        } else {
            new_id = id;
        }
        this._geom_arrays.id_maps.plineID.set(idx, new_id);
        this._geom_arrays.id_maps.plineIdx.set(new_id, idx);
    }
    /**
     * Create a new pline ID in the ID maps.
     * @param id
     */
    public newPlineID(idx: number): void {
        const id: string = 'pl' + this._geom_arrays.id_counts.plines;
        this._geom_arrays.id_maps.plineID.set(idx, id);
        this._geom_arrays.id_maps.plineIdx.set(id, idx);
        this._geom_arrays.id_counts.plines += 1;
    }
    /**
     * Get the ID from a pgon index
     * @param idx
     */
    public pgonID(idx: number): TId {
        return this._geom_arrays.id_maps.pgonID.get(idx);
    }
    /**
     * Get the array index from a pgon ID
     * @param id
     */
    public pgonIdx(id: TId): number {
        return this._geom_arrays.id_maps.pgonIdx.get(id);
    }
    /**
     * Try to merge a new pgon ID in the ID maps.
     * @param id
     */
    public mergePgonID(idx: number, id: TId): void {
        let new_id: TId;
        if (this._geom_arrays.id_maps.pgonIdx.get(id) !== undefined) {
            new_id = 'pg' + this._geom_arrays.id_counts.pgons;
            this._geom_arrays.id_counts.pgons += 1;
        } else {
            new_id = id;
        }
        this._geom_arrays.id_maps.pgonID.set(idx, new_id);
        this._geom_arrays.id_maps.pgonIdx.set(new_id, idx);
    }
    /**
     * Create a new pgon ID in the ID maps.
     * @param id
     */
    public newPgonID(idx: number): void {
        const id: string = 'pg' + this._geom_arrays.id_counts.pgons;
        this._geom_arrays.id_maps.pgonID.set(idx, id);
        this._geom_arrays.id_maps.pgonIdx.set(id, idx);
        this._geom_arrays.id_counts.pgons += 1;
    }
    /**
     * Get the ID from a coll index
     * @param idx
     */
    public collID(idx: number): TId {
        return this._geom_arrays.id_maps.collID.get(idx);
    }
    /**
     * Get the array index from a coll ID
     * @param id
     */
    public collIdx(id: TId): number {
        return this._geom_arrays.id_maps.collIdx.get(id);
    }
    /**
     * Try to merge a new coll ID in the ID maps.
     * @param id
     */
    public mergeCollID(idx: number, id: TId): void {
        let new_id: TId;
        if (this._geom_arrays.id_maps.collIdx.get(id) !== undefined) {
            new_id = 'co' + this._geom_arrays.id_counts.colls;
            this._geom_arrays.id_counts.colls += 1;
        } else {
            new_id = id;
        }
        this._geom_arrays.id_maps.collID.set(idx, new_id);
        this._geom_arrays.id_maps.collIdx.set(new_id, idx);
    }
    /**
     * Create a new coll ID in the ID maps.
     * @param id
     */
    public newCollID(idx: number): void {
        const id: string = 'pg' + this._geom_arrays.id_counts.colls;
        this._geom_arrays.id_maps.collID.set(idx, id);
        this._geom_arrays.id_maps.collIdx.set(id, idx);
        this._geom_arrays.id_counts.colls += 1;
    }
}
