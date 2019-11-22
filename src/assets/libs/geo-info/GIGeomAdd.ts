import { EEntType, TTri, TFace, Txyz, IGeomArrays, TAttribDataTypes, TEdge, TCollTree, TColl } from './common';
import { triangulate } from '../triangulate/triangulate';
import { GIGeom } from './GIGeom';
import { vecAdd } from '../geom/vectors';
import { GIGeomData } from './GIGeomData';

/**
 * Class for geometry.
 */
export class GIGeomAdd {
    private geom: GIGeom;
    /**
     * Constructor
     */
    constructor(geom: GIGeom) {
        this.geom = geom;
    }
    // ============================================================================
    // Add geometry
    // ============================================================================
    /**
     * Adds a new point entity to the model.
     */
    public addPoint(posi_i: number): number {
        const vert_i = this.geom.data.addVertEnt(posi_i);
        return this.geom.data.addPointEnt(vert_i);
    }
    /**
     * Adds a new pline entity to the model using numeric indices.
     * @param posis_i
     */
    public addPline(posis_i: number[], close: boolean = false): number {
        // create verts, edges, wires
        const verts_i: number[] = posis_i.map( posi_i => this.geom.data.addVertEnt(posi_i));
        const edges_i: number[] = this.geom.data.addEdgeEnts(verts_i, close);
        const wire_i: number = this.geom.data.addWireEnt(edges_i);
        // create pline
        return this.geom.data.addPlineEnt(wire_i);
    }
    /**
     * Adds a new polygon + hole entity to the model using numeric indices.
     * @param posis_id
     */
    public addPgon(posis_i: number[], holes_posis_i?: number[][]): number {
        const has_holes: boolean = (holes_posis_i !== undefined) && (holes_posis_i.length) ? true : false ;
        // create verts, edges, wire for face
        const verts_i: number[] = posis_i.map( posi_i => this.geom.data.addVertEnt(posi_i));
        const edges_i: number[] = this.geom.data.addEdgeEnts(verts_i, true);
        const wire_i: number = this.geom.data.addWireEnt(edges_i);
        const wires_i: number[] = [wire_i];
        if (has_holes) {
        // create verts, edges, wire for holes
            for (const hole_posis_i of holes_posis_i) {
                const hole_verts_i: number[] = hole_posis_i.map( posi_i => this.geom.data.addVertEnt(posi_i));
                const hole_edges_i: number[] = this.geom.data.addEdgeEnts(hole_verts_i, true);
                const hole_wire_i: number = this.geom.data.addWireEnt(hole_edges_i);
                wires_i.push(hole_wire_i);
            }
        }
        // insert the face into the data
        const face: TFace = [wires_i, []]; // no triangles yet
        const face_i: number = this.geom.data.addFaceEnt(face);
        // triangulate the new face
        this.geom.data.faceTri(face_i);
        // insert the polygon into the data
        const pgon_i: number = this.geom.data.addPgonEnt(face_i);
        // return the pgon index
        return pgon_i;
    }
    /**
     * Adds a collection and updates the rev array using numeric indices.
     * @param parent_i
     * @param points_i
     * @param plines_i
     * @param pgons_i
     */
    public addColl(parent_i: number, points_i: number[], plines_i: number[], pgons_i: number[]): number {
        // create collection
        const coll: TColl = [parent_i, points_i, plines_i, pgons_i];
        return this.geom.data.addCollEnt(coll);
    }
    // ============================================================================
    // Copy geometry
    // ============================================================================
    /**
     * Copy positions.
     * @param posis_i
     * @param copy_attribs
     */
    public copyMovePosis(posis_i: number|number[], move_vector: Txyz, copy_attribs: boolean): number|number[] {
        if (!Array.isArray(posis_i)) {
            const posi_i: number = posis_i as number;
            const xyz: Txyz = this.geom.model.attribs.query.getPosiCoords(posi_i);
            const new_posi_i: number = this.geom.model.createPosi(vecAdd(xyz, move_vector));
            if (copy_attribs) {
                const attrib_names: string[] = this.geom.model.attribs.query.getAttribNames(EEntType.POSI);
                for (const attrib_name of attrib_names) {
                    if (attrib_name !== 'xyz') {
                        const value: TAttribDataTypes =
                            this.geom.model.attribs.query.getAttribVal(EEntType.POSI, attrib_name, posis_i) as TAttribDataTypes;
                        this.geom.model.attribs.add.setAttribVal(EEntType.POSI, new_posi_i, attrib_name, value);
                    }
                }
            }
            return new_posi_i;
        } else {
            return (posis_i as number[]).map(posi_i => this.copyPosis(posi_i, copy_attribs)) as number[];
        }
    }
    /**
     * Copy positions.
     * @param posis_i
     * @param copy_attribs
     */
    public copyPosis(posis_i: number|number[], copy_attribs: boolean): number|number[] {
        if (!Array.isArray(posis_i)) {
            const posi_i: number = posis_i as number;
            const xyz: Txyz = this.geom.model.attribs.query.getPosiCoords(posi_i);
            const new_posi_i: number = this.geom.model.createPosi(xyz);
            if (copy_attribs) {
                const attrib_names: string[] = this.geom.model.attribs.query.getAttribNames(EEntType.POSI);
                for (const attrib_name of attrib_names) {
                    const value: TAttribDataTypes =
                        this.geom.model.attribs.query.getAttribVal(EEntType.POSI, attrib_name, posis_i) as TAttribDataTypes;
                    this.geom.model.attribs.add.setAttribVal(EEntType.POSI, new_posi_i, attrib_name, value);
                }
            }
            return new_posi_i;
        } else {
            return (posis_i as number[]).map(posi_i => this.copyPosis(posi_i, copy_attribs)) as number[];
        }
    }
    /**
     * Copy points.
     * TODO copy attribs of topo entities
     * @param index
     * @param copy_attribs
     */
    public copyPoints(points_i: number|number[], copy_attribs: boolean): number|number[] {
        // make copies
        if (!Array.isArray(points_i)) {
            const old_point_i: number = points_i as number;
            const posis_i: number[] = this.geom.data.navAnyToPosi(EEntType.POINT, old_point_i);
            const new_point_i: number = this.addPoint(posis_i[0]);
            if (copy_attribs) {
                this.geom.model.attribs.add.copyAttribs(EEntType.POINT, old_point_i, new_point_i);
            }
            return new_point_i;
        } else { // An array of ent_i
            return (points_i as number[]).map(point_i => this.copyPoints(point_i, copy_attribs)) as number[];
        }
    }
    /**
     * Copy plines.
     * TODO copy attribs of topo entities
     * @param index
     * @param copy_attribs
     */
    public copyPlines(plines_i: number|number[], copy_attribs: boolean): number|number[] {
        // make copies
        if (!Array.isArray(plines_i)) {
            const old_pline_i: number = plines_i as number;
            const posis_i: number[] = this.geom.data.navAnyToPosi(EEntType.PLINE, old_pline_i);
            const wire_i: number = this.geom.data.navPlineToWire(old_pline_i);
            const is_closed: boolean = this.geom.data.wireIsClosed(wire_i);
            const new_pline_i: number = this.addPline(posis_i, is_closed);
            if (copy_attribs) {
                this.geom.model.attribs.add.copyAttribs(EEntType.PLINE, old_pline_i, new_pline_i);
            }
            return new_pline_i;
        } else { // An array of ent_i
            return (plines_i as number[]).map(pline_i => this.copyPlines(pline_i, copy_attribs)) as number[];
        }
    }
    /**
     * Copy polygons.
     * TODO copy attribs of topo entities
     * @param index
     * @param copy_attribs
     */
    public copyPgons(pgons_i: number|number[], copy_attribs: boolean): number|number[] {
        // make copies
        if (!Array.isArray(pgons_i)) {
            const old_pgon_i: number = pgons_i as number;
            const wires_i: number[] = this.geom.data.navAnyToWire(EEntType.PGON, old_pgon_i);
            const posis_i: number[] = this.geom.data.navAnyToPosi(EEntType.WIRE, wires_i[0] as number);
            let new_pgon_i: number;
            if (wires_i.length === 1) {
                new_pgon_i = this.addPgon(posis_i);
            } else {
                const holes_posis_i: number[][] = [];
                for (let i = 1; i < wires_i.length; i++) {
                    const hole_posis_i: number[] = this.geom.data.navAnyToPosi(EEntType.WIRE, wires_i[i] as number);
                    holes_posis_i.push(hole_posis_i);
                }
                new_pgon_i = this.addPgon(posis_i, holes_posis_i);
            }
            if (copy_attribs) {
                this.geom.model.attribs.add.copyAttribs(EEntType.PGON, old_pgon_i, new_pgon_i);
            }
            return new_pgon_i;
        } else { // AN array of ent_i
            return (pgons_i as number[]).map(pgon_i => this.copyPgons(pgon_i, copy_attribs)) as number[];
        }
    }
   /**
     * Copy a collection
     * TODO Copy attribs of object and topo entities
     * @param ent_type
     * @param index
     * @param copy_posis
     * @param copy_attribs
     */
    public copyColls(colls_i: number|number[], copy_attribs: boolean): number|number[] {
        // make copies
        if (!Array.isArray(colls_i)) {
            const old_coll_i: number = colls_i as number;
            // make a deep copy of the objects in the collection
            const points_i: number[] = this.geom.data.navCollToPoint(old_coll_i);
            const res1 = this.copyPoints(points_i, copy_attribs) as number[];
            const plines_i: number[] = this.geom.data.navCollToPline(old_coll_i);
            const res2 = this.copyPlines(plines_i, copy_attribs) as number[];
            const pgons_i: number[] = this.geom.data.navCollToPgon(old_coll_i);
            const res3 = this.copyPgons(pgons_i, copy_attribs) as number[];
            const parent: number = this.geom.data.collGetParent(old_coll_i);
            // add the new collection
            const new_coll_i: number = this.addColl(parent, res1, res2, res3);
            // copy the attributes from old collection to new collection
            if (copy_attribs) {
                this.geom.model.attribs.add.copyAttribs(EEntType.COLL, old_coll_i, new_coll_i);
            }
            // return the new collection
            return new_coll_i;
        } else {
            return (colls_i as number[]).map(coll_i => this.copyColls(coll_i, copy_attribs)) as number[];
        }
    }
}
