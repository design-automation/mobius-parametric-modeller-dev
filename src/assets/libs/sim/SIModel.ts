import { GIGeom } from './geom/Geom';
import { GIAttribs } from './attribs/Attribs';
import { IModelData, IGeomPack, Txy, Txyz } from './common';
import { GICalc } from './SIModelCalc';
import { GIModelComparator } from './SIModelComparator';
import { GIModelThreejs } from './SIModelThreejs';

/**
 * Geo-info model class.
 */
export class GIModel {
    [x: string]: any; // TODO: What is this???
    public geom: GIGeom;
    public attribs: GIAttribs;
    public calc: GICalc;
    public comparator: GIModelComparator;
    public threejs: GIModelThreejs;
    /**
     * Constructor
     */
    constructor(model_data?: IModelData) {
        this.geom = new GIGeom(this);
        this.attribs = new GIAttribs(this);
        this.calc = new GICalc(this.geom, this.attribs);
        this.comparator = new GIModelComparator(this);
        this.threejs = new GIModelThreejs(this);
        if (model_data) {
            this.setData(model_data);
        }
    }
    /**
     * Copys the data from a second model into this model.
     * The existing data in this model is not deleted.
     * @param model_data The GI model.
     */
    public merge(model: GIModel): void {
        this.attribs.io.merge(model.attribs._attribs_maps); // warning: must be before this.geom.io.merge()
        this.geom.io.merge(model.geom._geom_arrays);
    }
    /**
     * Sets the data in this model from JSON data.
     * Any existing data in the model is deleted.
     * @param model_data The JSON data.
     */
    public setData (model_data: IModelData): IGeomPack {
        this.attribs.io.setData(model_data.attributes); // warning: must be before this.geom.io.setData()
        const new_ents_i: IGeomPack = this.geom.io.setData(model_data.geometry);
        return new_ents_i;
    }
    /**
     * Returns the JSON data for this model.
     */
    public getData(): IModelData {
        return {
            geometry: this.geom.io.getData(),
            attributes: this.attribs.io.getData()
        };
    }
    /**
     * Check model for internal consistency
     */
    public check(): string[] {
        return this.geom.checker.check();
    }
    /**
     * Compares this model and another model.
     * ~
     * This is the answer model.
     * The other model is the submitted model.
     * ~
     * Both models will be modified in the process.
     * ~
     * @param model The model to compare with.
     */
    public compare(model: GIModel, normalize: boolean, check_geom_equality: boolean, check_attrib_equality: boolean):
            {percent: number, score: number, total: number, comment: string} {
        return this.comparator.compare(model, normalize, check_geom_equality, check_attrib_equality);
    }
    /**
     * Conv method for creating one position.
     * First creates the position in geom side.
     * Then sets the position xyz in attrib side.
     */
    public createPosi(xyz: Txyz): number {
        const posi_i: number = this.geom.data.addPosiEnt();
        this.attribs.add.setPosiCoords(posi_i, xyz);
        return posi_i;
    }
}
