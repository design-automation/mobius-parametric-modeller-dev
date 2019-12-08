import { IGeomArrays } from '../../common';
import { Geom } from '../Geom';
import { GeomNav } from './GeomNav';

/**
 * Working with faces.
 *
 */
export class GeomFace extends GeomNav {
    /**
     * Constructor
     */
    constructor(geom: Geom) {
        super(geom);
    }
    // ============================================================================
    // Faces
    // ============================================================================
    /**
     *
     * @param face_i
     */
    public getFaceBoundary(face_i: number): number {
        const wires_i: number[] = this._geom_arrays.dn_faces_wires[face_i];
        return wires_i[0];
    }
    /**
     *
     * @param face_i
     */
    public getFaceHoles(face_i: number): number[] {
        const wires_i: number[] = this._geom_arrays.dn_faces_wires[face_i];
        return wires_i.slice(1);
    }
    /**
     *
     * @param face_i
     */
    public faceHasHoles(face_i: number): boolean {
        return this._geom_arrays.dn_faces_wires[face_i].length > 1;
    }
}
