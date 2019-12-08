import { EEntType, TFace, TColl } from '../common';
import { GIGeom } from './Geom';

/**
 * Class for deleting geometry.
 */
export class GIGeomDel {
    private geom: GIGeom;
    /**
     * Constructor
     */
    constructor(geom: GIGeom) {
        this.geom = geom;
    }
    // ============================================================================
    // Delete geometry
    // ============================================================================
    /**
     * Given an array pod posis_i, it check each  posi to see if it is used.
     * IF not, it deletes teh posi.
     * ~
     * Posi attributes will also be deleted.
     * @param posis_i
     */
    public delUnusedPosis(posis_i: number|number[]): void {
        // create array
        posis_i = (Array.isArray(posis_i)) ? posis_i : [posis_i];
        if (posis_i.length === 0) { return; }
        // loop
        const deleted_posis_i: number[] = [];
        for (const posi_i of posis_i) {
            if (!this.geom.data.entExists(EEntType.POSI, posi_i)) { continue; } // already deleted
            const verts_i: number[] = this.geom.data.navPosiToVert(posi_i);
            if (verts_i.length === 0) { // only delete posis with no verts
                this.geom.data.remPosiEnt(posi_i);
                deleted_posis_i.push(posi_i);
            }
            // no need to update down arrays
        }
        // delete all the posi attributes, for all posis that were deleted
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.POSI, deleted_posis_i);
    }
    /**
     * Del posis.
     * Posi attributes will also be deleted.
     * @param posis_i
     */
    public delPosis(posis_i: number|number[]): number[] {
        // create array
        posis_i = (Array.isArray(posis_i)) ? posis_i : [posis_i];
        if (posis_i.length === 0) { return; }
        // loop
        const other_posis_i: number[] = [];
        for (const posi_i of posis_i) {
            if (!this.geom.data.entExists(EEntType.POSI, posi_i)) { continue; } // already deleted
            // delete all verts for this posi
            const verts_i: number[] = this.geom.data.navPosiToVert(posi_i);
            for (const vert_i of verts_i) {
                const secondary_posis_i: number[] = this.geom.del_vert.delVert(vert_i);
                for (const secondary_posi_i of secondary_posis_i) {
                    other_posis_i.push(secondary_posi_i);
                }
            }
            // delete the posi
            this.geom.data.remPosiEnt(posi_i);
            // no need to update down arrays
        }
        return other_posis_i;
    }
    /**
     * Del points.
     * Point attributes will also be deleted.
     * @param points_i
     */
    public delPoints(points_i: number|number[]): number[] {
        // create array
        points_i = (Array.isArray(points_i)) ? points_i : [points_i];
        if (!points_i.length) { return []; }
        // del attribs
        this.geom.model.attribs.add.delEntFromAttribs(EEntType.POINT, points_i);
        // loop
        const posis_i: number[] = [];
        for (const point_i of points_i) {
            if (!this.geom.data.entExists(EEntType.POINT, point_i)) { continue; } // already deleted
            // remove from collections
            for (const coll_i of this.geom.data.navAnyToColl(EEntType.POINT, point_i)) {
                this.geom.data.collRemovePoint(coll_i, point_i);
            }
            // delete
            const vert_i: number = this.geom.data.remPointEnt(point_i);
            const posi_i: number = this.geom.data.remVertEnt(vert_i);
            if (posi_i !== null) {
                posis_i.push(posi_i);
            }
        }
        // return the posis
        return posis_i;
    }
    /**
     * Del plines.
     * Pline attributes will also be deleted.
     * @param plines_i
     */
    public delPlines(plines_i: number|number[]): number[] {
        // create array
        plines_i = (Array.isArray(plines_i)) ? plines_i : [plines_i];
        if (!plines_i.length) { return []; }
        // loop
        const posis_i: number[] = [];
        for (const pline_i of plines_i) {
            if (!this.geom.data.entExists(EEntType.PLINE, pline_i)) { continue; } // already deleted
            // remove from collections
            for (const coll_i of this.geom.data.navAnyToColl(EEntType.PLINE, pline_i)) {
                this.geom.data.collRemovePoint(coll_i, pline_i);
            }
            // delete
            const wire_i: number = this.geom.data.remPlineEnt(pline_i);
            const edges_i: number[] = this.geom.data.remWireEnt(wire_i);
            for (const edge_i of edges_i) {
                const verts_i: number[] = this.geom.data.remEdgeEnt(edge_i);
                for (const vert_i of verts_i) {
                    const posi_i: number = this.geom.data.remVertEnt(vert_i);
                    if (posi_i !== null) {
                        posis_i.push(posi_i);
                    }
                }
            }
        }
        // return the posis
        return posis_i;
    }
    /**
     * Del pgons.
     * Pgon attributes will also be deleted.
     */
    public delPgons(pgons_i: number|number[]): number[] {
        // create array
        pgons_i = (Array.isArray(pgons_i)) ? pgons_i : [pgons_i];
        if (!pgons_i.length) { return []; }
        // loop
        const posis_i: number[] = [];
        for (const pgon_i of pgons_i) {
            if (!this.geom.data.entExists(EEntType.PGON, pgon_i)) { continue; } // already deleted
            // remove from collections
            for (const coll_i of this.geom.data.navAnyToColl(EEntType.PGON, pgon_i)) {
                this.geom.data.collRemovePgon(coll_i, pgon_i);
            }
            // delete the tree
            const face_i: number = this.geom.data.remPgonEnt(pgon_i);
            const face: TFace = this.geom.data.remFaceEnt(face_i);
            const wires_i: number[] = face[0];
            const tris_i: number[] = face[1];
            for (const wire_i of wires_i) {
                const edges_i: number[] = this.geom.data.remWireEnt(wire_i);
                for (const edge_i of edges_i) {
                    const verts_i: number[] = this.geom.data.remEdgeEnt(edge_i);
                    for (const vert_i of verts_i) {
                        const posi_i: number = this.geom.data.remVertEnt(vert_i);
                        if (posi_i !== null) {
                            posis_i.push(posi_i);
                        }
                    }
                }
            }
            for (const tri_i of tris_i) {
                this.geom.data.remTriEnt(tri_i);
                // the verts of the tris are already deleted
            }
        }
        // return the posis
        return posis_i;
    }
    /**
     * Del holes in pgons.
     * Pgon attributes will also be deleted.
     */
    public delPgonHoles(wires_i: number|number[]): number[] {
        // create array
        wires_i = (Array.isArray(wires_i)) ? wires_i : [wires_i];
        if (!wires_i.length) { return []; }
        // loop
        const posis_i: number[] = [];
        for (const wire_i of wires_i) {
            if (!this.geom.data.entExists(EEntType.PGON, wire_i)) { continue; } // already deleted
            // get the face
            const face_i: number = this.geom.data.navWireToFace(wire_i);
            // unlink the wire from the face
            this.geom.data.unlinkFaceWire(face_i, wire_i);
            // delete all the entities
            const edges_i: number[] = this.geom.data.remWireEnt(wire_i);
            for (const edge_i of edges_i) {
                const verts_i: [number, number] = this.geom.data.remEdgeEnt(edge_i);
                for (const vert_i of verts_i) {
                    posis_i.push( this.geom.data.remVertEnt(vert_i));
                }
            }
        }
        // return the posis
        return posis_i;
    }
    /**
     * Delete a collection.
     * Collection attributes will also be deleted.
     * This delete all the object in the collection.
     * Also, does not delete any positions.
     * @param colls_i The collections to delete
     */
    public delColls(colls_i: number|number[], del_contents: boolean): number[] {
        // create array
        colls_i = (Array.isArray(colls_i)) ? colls_i : [colls_i];
        if (!colls_i.length) { return []; }
        // loop
        const set_posis_i: Set<number> = new Set();
        for (const coll_i of colls_i) {
            if (!this.geom.data.entExists(EEntType.COLL, coll_i)) { continue; } // already deleted
            // remove the coll
            const coll: TColl = this.geom.data.remCollEnt(coll_i);
            if (del_contents) {
                // process coll points
                const point_posis_i: number[] = this.delPoints(coll[1]);
                point_posis_i.forEach( posi_i => set_posis_i.add(posi_i) );
                // process coll plines
                const pline_posis_i: number[] = this.delPlines(coll[2]);
                pline_posis_i.forEach( posi_i => set_posis_i.add(posi_i) );
                // process coll pgons
                const pgon_posis_i: number[] = this.delPgons(coll[3]);
                pgon_posis_i.forEach( posi_i => set_posis_i.add(posi_i) );
                // process child colls, recursive
                const child_colls_i: number[] = this.geom.data.collGetChildren(coll_i);
                const coll_posis_i: number[] = this.delColls(child_colls_i, del_contents);
                coll_posis_i.forEach( posi_i => set_posis_i.add(posi_i) );
            }
        }
        // return the posis
        return Array.from(set_posis_i);
    }
}


        // by default all posis are deleted unless
        // 1) the are part of the ents to keep
        // 2) they are explicitly listed to be kept
        // So the process for deleting is as follows
        // 1) del all ents
        // 2) get all posis without verts and check if they are listed to be kept
        // 3) del those posis
