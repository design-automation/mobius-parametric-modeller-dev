import {  EEntType, IGeomArrays,  Txyz } from './common';
import { GIGeom } from './geom/Geom';
import { vecFromTo, vecCross, vecDiv } from '../geom/vectors';
import { GIAttribs } from './attribs/Attribs';
/**
 * Class for calculating stuff that requires bothe geometry and attributes.
 */
export class GICalc {
    private _geom: GIGeom;
    public _attribs: GIAttribs;
    /**
     * Constructor
     */
    constructor(geom: GIGeom, attribs: GIAttribs) {
        this._geom = geom;
        this._attribs = attribs;
    }
    /**
     * Calc the normal of a face
     */
    public getFaceNormal(face_i: number): Txyz {
        const normal: Txyz = [0, 0, 0];
        const tris_i: number[] = this._geom.data.navAnyToTri(EEntType.FACE, face_i);
        let count = 0;
        for (const tri_i of tris_i) {
            const posis_i: number[] = this._geom.data.navAnyToPosi(EEntType.TRI, tri_i);
            const xyzs: Txyz[] = posis_i.map(posi_i => this._geom.model.attribs.query.getPosiCoords(posi_i));
            const vec_a: Txyz = vecFromTo(xyzs[0], xyzs[1]);
            const vec_b: Txyz = vecFromTo(xyzs[0], xyzs[2]); // CCW
            const tri_normal: Txyz = vecCross(vec_a, vec_b, true);
            if (!(tri_normal[0] === 0 && tri_normal[1] === 0 && tri_normal[2] === 0)) {
                count += 1;
                normal[0] += tri_normal[0];
                normal[1] += tri_normal[1];
                normal[2] += tri_normal[2];
            }
        }
        if (count === 0) { return [0, 0, 0]; }
        return vecDiv(normal, count);
    }
    /**
     * Calc the centroid of any entity
     */
    public getCentroid(ent_type: EEntType, ent_i: number): Txyz {
        const posis_i: number[] = this._geom.data.navAnyToPosi(ent_type, ent_i);
        const centroid: Txyz = [0, 0, 0];
        for (const posi_i of posis_i) {
            const xyz: Txyz = this._geom.model.attribs.query.getPosiCoords(posi_i);
            centroid[0] += xyz[0];
            centroid[1] += xyz[1];
            centroid[2] += xyz[2];
        }
        return vecDiv(centroid, posis_i.length);
    }
    /**
     * Calc the centre of gravity of an entity
     */
    public getCenOfGrav(ent_type: EEntType, ent_i: number): Txyz {
        // for faces,
        // https://gis.stackexchange.com/questions/164267/how-exactly-is-the-centroid-of-polygons-calculated/164270
        // similar for wires
        // for edges, midpoint
        // for vertices, and posis, the posi
        // for collections I am not sure what to do
        throw new Error("not implemented");
    }
    /**
     * Calc the normal of a wire
     */
    public getWireNormal(wire_i: number): Txyz {
        const centroid: Txyz = this.getCentroid(EEntType.WIRE, wire_i);
        const edges_i: number[] = this._geom.data.navWireToEdge(wire_i);
        const normal: Txyz = [0, 0, 0];
        let count = 0;
        for (const edge_i of edges_i) {
            const posis_i: number[] = this._geom.data.navAnyToPosi(EEntType.EDGE, edge_i);
            const xyzs: Txyz[] = posis_i.map(posi_i => this._geom.model.attribs.query.getPosiCoords(posi_i));
            const vec_a: Txyz = vecFromTo(centroid, xyzs[0]);
            const vec_b: Txyz = vecFromTo(centroid, xyzs[1]); // CCW
            const tri_normal: Txyz = vecCross(vec_a, vec_b, true);
            if (!(tri_normal[0] === 0 && tri_normal[1] === 0 && tri_normal[2] === 0)) {
                count += 1;
                normal[0] += tri_normal[0];
                normal[1] += tri_normal[1];
                normal[2] += tri_normal[2];
            }
        }
        if (count === 0) { return [0, 0, 0]; }
        return vecDiv(normal, count);
    }
}
