import { IGeomArrays } from '../../common';
import { GIGeom } from '../GIGeom';
import { GIGeomNav } from './GIGeomNav';

/**
 * Working with faces.
 *
 */
export class GIGeomFace extends GIGeomNav {
    /**
     * Constructor
     */
    constructor(geom: GIGeom, geom_arrays: IGeomArrays) {
        super(geom, geom_arrays);
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
}
