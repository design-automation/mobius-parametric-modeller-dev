import { Geom } from './geom/Geom';
import { Attribs } from './attribs/Attribs';
import { IModelData, IGeomPack, Txy, Txyz } from './common';
import { GICalc } from './SIModelCalc';
import { SIModelComparator } from './SIModelCompare';
import { SIModelThreejs } from './SIModelThreejs';

/**
 * Geo-info model class.
 */
export class SIModel {
    [x: string]: any; // TODO: What is this???
    public geom: Geom;
    public attribs: Attribs;
    public calc: GICalc;
    public comparator: SIModelComparator;
    public threejs: SIModelThreejs;
    /**
     * Constructor
     */
    constructor(model_data?: IModelData) {
        this.geom = new Geom(this);
        this.attribs = new Attribs(this);
        this.calc = new GICalc(this.geom, this.attribs);
        this.comparator = new SIModelComparator(this);
        this.threejs = new SIModelThreejs(this);
        if (model_data) {
            this.setData(model_data);
        }
    }
    /**
     * Copys the data from a second model into this model.
     * The existing data in this model is not deleted.
     * @param model_data The GI model.
     */
    public merge(model: SIModel): void {
        this.attribs.data.merge(model.attribs); // warning: must be before this.geom.data.merge()
        this.geom.data.merge(model.geom);
    }
    /**
     * Sets the data in this model from data.
     * Any existing data in the model is deleted.
     * @param model_data The data.
     */
    public setData (model_data: IModelData): void {
        this.attribs.data.setData(model_data.attributes); // warning: must be before this.geom.io.setData()
        this.geom.data.setData(model_data.geometry, true); // replace null with undef
    }
    /**
     * Returns the data for this model.
     */
    public getData(): IModelData {
        return {
            geometry: this.geom.data.getData(true), // replace undef with null
            attributes: this.attribs.data.getData()
        };
    }
    /**
     * Check model for internal consistency
     */
    public check(): string[] {
        return this.geom.data.check();
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
    public compare(model: SIModel, normalize: boolean, check_geom_equality: boolean, check_attrib_equality: boolean):
            {percent: number, score: number, total: number, comment: string} {
        return this.comparator.compare(model, normalize, check_geom_equality, check_attrib_equality);
    }
    /**
     * Conv method for creating one position.
     * First creates the position in geom side.
     * Then sets the position xyz in attrib side.
     */
    public createPosi(xyz: Txyz): number {
        const posi_i: number = this.geom.data.pushPosiEnt();
        this.attribs.add.setPosiCoords(posi_i, xyz);
        return posi_i;
    }
}
