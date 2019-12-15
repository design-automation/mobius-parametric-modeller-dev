import { EEntType, IGeomArrays, TColl, TCollPoints, TCollPlines, TCollPgons } from '../../common';
import { isPosi, isVert, isPoint, isEdge, isWire, isPline, isFace, isPgon, isColl, isTri } from '../../id';
import { Geom } from '../Geom';
import { GeomPrint } from './GeomPrint';

/**
 * Class for navigating the datastructure
 * This is parent of all the other classes
 */
export class GeomNav extends GeomPrint { // extends GeomBase
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
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
        const ents_i: number[] = this._geom_arrays.dn_faces_wires[face_i];
        if (ents_i) { return ents_i.slice(); }
        return ents_i;
    }
    public navFaceToTri(face_i: number): number[] {
        const ents_i: number[] = this._geom_arrays.dn_faces_tris[face_i];
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
        const all_colls_i: number[] = this.collGetDescendents(coll_i);
        all_colls_i.push(coll_i);
        const set_ents_i: Set<number> = new Set();
        for (const coll2_i of all_colls_i) {
            const ents_i: number[] = this._geom_arrays.dn_colls_points[coll2_i];
            for (const ent_i of ents_i) {
                set_ents_i.add(ent_i);
            }
        }
        return Array.from(set_ents_i); // coll points
    }
    public navCollToPline(coll_i: number): number[] {
        const all_colls_i: number[] = this.collGetDescendents(coll_i);
        all_colls_i.push(coll_i);
        const set_ents_i: Set<number> = new Set();
        for (const coll2_i of all_colls_i) {
            const ents_i: number[] = this._geom_arrays.dn_colls_plines[coll2_i];
            for (const ent_i of ents_i) {
                set_ents_i.add(ent_i);
            }
        }
        return Array.from(set_ents_i); // coll lines
    }
    public navCollToPgon(coll_i: number): number[] {
        const all_colls_i: number[] = this.collGetDescendents(coll_i);
        all_colls_i.push(coll_i);
        const set_ents_i: Set<number> = new Set();
        for (const coll2_i of all_colls_i) {
            const ents_i: number[] = this._geom_arrays.dn_colls_pgons[coll2_i];
            for (const ent_i of ents_i) {
                set_ents_i.add(ent_i);
            }
        }
        return Array.from(set_ents_i); // coll pgons
    }
    public navCollToColl(coll_i: number): number[] {
        return this.collGetDescendents(coll_i);
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
        const ents_i: [number, number] = this._geom_arrays.up_verts_edges[vert_i];
        const edges_i: number[] = [];
        if (ents_i[0] !== null) {  edges_i.push(ents_i[0]); }
        if (ents_i[1] !== null) {  edges_i.push(ents_i[1]); }
        return edges_i as [number, number];
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
        console.log(">>>", tri_i, verts_i, this._geom_arrays.dn_tris_verts)
        const posis_i: number[] = [];
        for (const vert_i of verts_i) {
            posis_i.push( this._geom_arrays.dn_verts_posis[vert_i] );
        }
        return posis_i;
    }
    private getFacePosis(face_i: number): number[] {
        const set_posis_i: Set<number> = new Set();
        const wires_i: number[] = this._geom_arrays.dn_faces_wires[face_i];
        for (const wire_i of wires_i) {
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
        const coll_points: TCollPoints = this._geom_arrays.dn_colls_points[coll_i];
        const coll_plines: TCollPlines = this._geom_arrays.dn_colls_plines[coll_i];
        const coll_pgons: TCollPgons = this._geom_arrays.dn_colls_pgons[coll_i];
        for (const point_i of coll_points) {
            set_posis_i.add(this.getPointPosi(point_i));
        }
        for (const pline_i of coll_plines) {
            this.getPlinePosis(pline_i).forEach(posi_i => set_posis_i.add(posi_i));
        }
        for (const pgon_i of coll_pgons) {
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
}

// export interface GeomNav extends GeomColl, GeomWire {}
// applyMixins(GeomNav, [GeomColl, GeomWire]);
