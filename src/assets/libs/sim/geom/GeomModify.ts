import { EEntType, TEdge, TWire, Txyz } from '../common';
import { Geom } from './Geom';
import { vecDot } from '../../geom/vectors';

/**
 * Class for geometry.
 */
export class GeomModify {
    private geom: Geom;
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        this.geom = geom;
    }
    // ============================================================================
    // Modify geometry
    // ============================================================================
    /**
     * Insert a vertex into an edge and updates the wire with the new edge
     * ~
     * Applies to both plines and pgons.
     * ~
     * Plines can be open or closed.
     * ~
     */
    public divideEdge(edge_i: number, posis_i: number|number[]): number|number[] {
        const wire_i: number = this.geom.data.navEdgeToWire(edge_i);
        const old_edge_verts_i: TEdge = this.geom.data.navEdgeToVert(edge_i);
        // make sure posis is an array
        const return_arr: boolean = Array.isArray(posis_i);
        posis_i = Array.isArray(posis_i) ? posis_i : [posis_i];
        // loop
        const new_edges_i: number[] = [];
        let prev_vert_i: number = old_edge_verts_i[0];
        for (const posi_i of posis_i) {
            // create one new vertex and one new edge
            const new_vert_i: number = this.geom.data.addVertEnt(posi_i);
            const new_edge: TEdge = [prev_vert_i, new_vert_i];
            const new_edge_i: number = this.geom.data.addEdgeEnt(new_edge);
            new_edges_i.push(new_edge_i);
            prev_vert_i = new_vert_i;
        }
        // create the last edge
        const new_last_edge: TEdge = [prev_vert_i, old_edge_verts_i[1]];
        const new_last_edge_i: number = this.geom.data.addEdgeEnt(new_last_edge);
        new_edges_i.push(new_last_edge_i);
        // update the wire
        const wire: TWire = this.geom.data.navWireToEdge(wire_i);
        const idx: number = wire.indexOf(edge_i);
        wire.splice(idx, 1, ...new_edges_i);
        this.geom.data.updateWireEnt(wire, wire_i);
        // delete the old edge, but dont delete the vertices
        this.geom.data.remEdgeEnt(edge_i);
        this.geom.data.unlinkEdgeToWire(edge_i, wire_i);
        // return the new edge or edges
        if (!return_arr) { return new_edges_i[0]; }
        return new_edges_i;
    }
    /**
     * Replace all positions in an entity with a new set of positions.
     * ~
     */
    public replacePosis(ent_type: EEntType, ent_i: number, new_posis_i: number[]): void {
        const verts_i: number[] = this.geom.data.navAnyToVert(ent_type, ent_i);
        if (verts_i.length !== new_posis_i.length) {
            throw new Error('Error replacing posis: The numbr of new posis must be the same as the number of existing posis.');
        }
        // insert the new posis into the old verts
        for (let i = 0; i < verts_i.length; i++) {
            const vert_i: number = verts_i[i];
            // unlink the old posi
            const old_posi_i: number = this.geom.data.navVertToPosi(vert_i);
            this.geom.data.unlinkPosiToVert(old_posi_i, vert_i);
            // insert the new posi
            const new_posi_i: number = new_posis_i[i];
            this.geom.data.updateVertEnt(new_posi_i, vert_i);
        }
    }
    /**
     * Unweld the vertices on naked edges.
     * ~
     */
    public cloneVertPosisShallow(verts_i: number[]): number[] {
        // create a map, for each posi_i, count how many verts there are in the input verts
        const exist_posis_i_map: Map<number, number> = new Map(); // posi_i -> count
        for (const vert_i of verts_i) {
            const posi_i: number = this.geom.data.navVertToPosi(vert_i);
            if (!exist_posis_i_map.has(posi_i)) {
                exist_posis_i_map.set(posi_i, 0);
            }
            const vert_count: number = exist_posis_i_map.get(posi_i);
            exist_posis_i_map.set(posi_i, vert_count + 1);
        }
        // copy positions on the perimeter and make a map
        const old_to_new_posis_i_map: Map<number, number> = new Map();
        exist_posis_i_map.forEach( (vert_count, old_posi_i) => {
            const all_old_verts_i: number[] = this.geom.data.navPosiToVert(old_posi_i);
            const all_vert_count: number = all_old_verts_i.length;
            if (vert_count !== all_vert_count) {
                if (!old_to_new_posis_i_map.has(old_posi_i)) {
                    const new_posi_i: number = this.geom.add.copyPosis(old_posi_i, true) as number;
                    old_to_new_posis_i_map.set(old_posi_i, new_posi_i);
                }
            }
        });
        // now go through the geom again and rewire to the new posis
        for (const vert_i of verts_i) {
            const old_posi_i: number = this.geom.data.navVertToPosi(vert_i);
            if (old_to_new_posis_i_map.has(old_posi_i)) {
                const new_posi_i: number = old_to_new_posis_i_map.get(old_posi_i);
                // unlink the old posi
                this.geom.data.unlinkPosiToVert(old_posi_i, vert_i);
                // insert the new posi
                this.geom.data.updateVertEnt(new_posi_i, vert_i);
            }
        }
        // return all the new positions
        return Array.from(old_to_new_posis_i_map.values());
    }
    /**
     * Unweld all vertices by cloning the positions that are shared.
     * ~
     * Attributes on the positions are  copied.
     * ~
     * @param verts_i
     */
    public cloneVertPosis(verts_i: number[]): number[] {
        const new_posis_i: number[] = [];
        for (const vert_i of verts_i) {
            const exist_posi_i: number = this.geom.data.navVertToPosi(vert_i);
            const all_verts_i: number[] = this.geom.data.navPosiToVert(exist_posi_i);
            if (all_verts_i.length > 1) {
                // copy the posi
                const new_posi_i: number = this.geom.add.copyPosis(exist_posi_i, true) as number;
                // unlink the existing posi
                this.geom.data.unlinkPosiToVert(exist_posi_i, vert_i);
                // insert the new posi
                this.geom.data.updateVertEnt(new_posi_i, vert_i);
                // add the new posi_i to the list, to be returned later
                new_posis_i.push(new_posi_i);
            }
        }
        // return all the new positions
        return new_posis_i;
    }
    /**
     * Weld all vertices by merging the positions that are equal, so that they become shared.
     * ~
     * The old positions are deleted. Attributes on those positions are discarded.
     * ~
     * @param verts_i
     */
    public mergeVertPosis(verts_i: number[]): number[] {
        const new_posis_i: number[] = [];
        throw new Error('Not implemented');
        // return all the new positions
        return new_posis_i;
    }
    /**
     * Close a polyline.
     * ~
     * If the pline is already closed, do nothing.
     * ~
     */
    public plineClose(pline_i: number): number {
        const wire_i: number = this.geom.data.navPlineToWire(pline_i);
        if (this.geom.data.wireIsClosed(wire_i)) { return; }
        // get the wire start and end verts
        const wire: TWire = this.geom.data.navWireToEdge(wire_i);
        const num_edges: number = wire.length;
        const start_edge_i: number = wire[0];
        const end_edge_i: number = wire[num_edges - 1];
        const start_vert_i: number = this.geom.data.navEdgeToVert(start_edge_i)[0];
        const end_vert_i: number = this.geom.data.navEdgeToVert(end_edge_i)[1];
        // add the edge to the model
        const edge: TEdge = [end_vert_i, start_vert_i];
        const new_edge_i: number = this.geom.data.addEdgeEnt(edge);
        // link the wire to the new edge
        this.geom.data.linkWireEdge(wire_i, num_edges, new_edge_i);
        // return the new edge
        return new_edge_i;
    }
    /**
     * Open a wire, by deleting the last edge.
     *
     * If teh wire is already open, do nothing.
     *
     * @param wire_i The wire to close.
     */
    public plineOpen(pline_i: number): void {
        const wire_i: number = this.geom.data.navPlineToWire(pline_i);
        if (this.geom.data.wireIsOpen(wire_i)) { return; }
        // get the wire start and end verts
        const wire: TWire = this.geom.data.navWireToEdge(wire_i);
        // check wire has more than two edges
        const num_edges: number = wire.length;
        if (num_edges === 1) { return; }
        // get start and end
        const end_edge_i: number = wire[num_edges - 1];
        // unlink
        this.geom.data.unlinkWireEdge(wire_i, end_edge_i);
        // del the end edge from the pline
       this.geom.data.remEdgeEnt(end_edge_i);
    }
    /**
     * Creates one or more holes in a polygon.
     * ~
     */
    public cutPgonHoles(pgon_i: number, posis_i_arr: number[][]): number[] {
        const face_i: number = this.geom.data.navPgonToFace(pgon_i);
        // get the normal of the face
        const face_normal: Txyz = this.geom.model.calc.getFaceNormal(face_i);
        // make the wires for the holes
        const hole_wires_i: number[] = [];
        for (const hole_posis_i of posis_i_arr) {
            const hole_vert_i_arr: number[] = hole_posis_i.map( posi_i => this.geom.data.addVertEnt(posi_i));
            const hole_edges_i_arr: number[] = this.geom.data.addEdgeEnts(hole_vert_i_arr, true);
            const hole_wire_i: number = this.geom.data.addWireEnt(hole_edges_i_arr);
            // get normal of wire and check if we need to reverse the wire
            const wire_normal: Txyz = this.geom.model.calc.getWireNormal(hole_wire_i);
            if (vecDot(face_normal, wire_normal) > 0) {
                this.geom.data.wireReverse(hole_wire_i);
            }
            // add to list of holes
            hole_wires_i.push(hole_wire_i);
        }
        // create the holes, does everything at face level
        this.geom.data.faceCutHoles(face_i, hole_wires_i);
        // no need to change either the up or down arrays
        // return the new wires
        return hole_wires_i;
    }
}
