import { TAttribDataTypes, EEntType, EEntTypeStr } from '../common';
import { GIAttribMap } from './data/AttribMap';
import { isString } from 'util';
import { sortByKey } from '../../util/maps';
import { Attribs } from './Attribs';

/**
 * Class for attributes.
 */
export class AttribsTable {
    private _attribs: Attribs;
    /**
     * Constructor
     */
    constructor(attribs: Attribs) {
        this._attribs = attribs;
    }
    /**
     *
     */
    public getModelAttribsForTable(): any[] {
        const attribs_maps_key: string = EEntTypeStr[ EEntType.MOD ];
        const attribs: Map<string, TAttribDataTypes> = this._attribs._attribs_maps[attribs_maps_key];
        if (attribs === undefined) { return []; }
        const arr = [];
        attribs.forEach((value, key) => {
            // const _value = isString(value) ? `'${value}'` : value;
            const _value = JSON.stringify(value);
            const obj = {Name: key, Value: _value};
            arr.push(obj);
        });
        // console.log(arr);
        return arr;
    }
    /**
     *
     * @param ent_type
     */
    public getEntAttribsForTable(ent_type: EEntType): {data: any[], ents: number[]} {
        // get the attribs map for this ent type
        const attribs_maps_key: string = EEntTypeStr[ent_type];
        const attribs: Map<string, GIAttribMap> = this._attribs._attribs_maps[attribs_maps_key];

        // create a map of objects to store the data
        // const data_obj_map: Map< number, { '#': number, _id: string} > = new Map();
        const data_obj_map: Map< number, {_id: string} > = new Map();

        // create the ID for each table row
        const ents_i: number[] = this._attribs.model.geom.data.getEnts(ent_type);

        // sessionStorage.setItem('attrib_table_ents', JSON.stringify(ents_i));
        let i = 0;
        for (const ent_i of ents_i) {
            // data_obj_map.set(ent_i, { '#': i, _id: `${attribs_maps_key}${ent_i}`} );
            data_obj_map.set(ent_i, {_id: `${attribs_maps_key}${ent_i}`} );
            if (ent_type === EEntType.COLL) {
                const coll_parent = this._attribs.model.geom.data.collGetParent(ent_i);
                data_obj_map.get(ent_i)['_parent'] = coll_parent === undefined ? '' : coll_parent;
            }
            i++;
        }
        // loop through all the attributes
        attribs.forEach( (attrib, attrib_name) => {
            const data_size: number = attrib.getDataLength();
            for (const ent_i of ents_i) {
                if (attrib_name.substr(0, 1) === '_' && attrib_name !== '_parent') {
                    const attrib_value = attrib.getEntVal(ent_i);
                    data_obj_map.get(ent_i)[`${attrib_name}`] = attrib_value;
                } else {
                    const attrib_value = attrib.getEntVal(ent_i);
                    if (attrib_value && attrib_value.constructor === {}.constructor) {
                        data_obj_map.get(ent_i)[`${attrib_name}`] = JSON.stringify(attrib_value);
                    } else if ( data_size > 1 ) {
                        if (attrib_value === undefined) {
                            for (let idx = 0; idx < data_size; idx++) {
                                data_obj_map.get(ent_i)[`${attrib_name}[${idx}]`] = undefined;
                            }
                        } else {
                            (attrib_value as any[]).forEach( (v, idx) => {
                                const _v =  v;
                                data_obj_map.get(ent_i)[`${attrib_name}[${idx}]`] = _v;
                            });
                        }
                    } else {
                        if (ent_type === EEntType.POSI && Array.isArray(attrib_value)) {
                            if (attrib_value.length < 4) {
                                for (let index = 0; index < attrib_value.length; index++) {
                                    const _v = Array.isArray(attrib_value[index]) ?
                                    JSON.stringify(attrib_value[index]) : attrib_value[index];
                                    data_obj_map.get(ent_i)[`${attrib_name}[${index}]`] = _v;
                                }
                            } else {
                                data_obj_map.get(ent_i)[attrib_name] = JSON.stringify(attrib_value);
                            }
                        } else {
                            const _attrib_value = isString(attrib_value) ? `'${attrib_value}'` : attrib_value;
                            data_obj_map.get(ent_i)[`${attrib_name}`] = _attrib_value;
                        }
                    }
                }
            }
        });
        return { data: Array.from(data_obj_map.values()), ents: ents_i};
    }

    /**
     * @param ent_type
     * @param ents_i
     */
    public getEntsVals(selected_ents: Map<string, number>, ent_type: EEntType): any[] {
        const attribs_maps_key: string = EEntTypeStr[ent_type];
        const attribs: Map<string, GIAttribMap> = this._attribs._attribs_maps[attribs_maps_key];
        const data_obj_map: Map< number, { _id: string} > = new Map();
        if (!selected_ents || selected_ents === undefined) {
            return [];
        }
        let i = 0;
        const selected_ents_sorted = sortByKey(selected_ents);
        selected_ents_sorted.forEach(ent => {
            data_obj_map.set(ent, { _id: `${attribs_maps_key}${ent}` } );
            if (ent_type === EEntType.COLL) {
                const coll_parent = this._attribs.model.geom.data.collGetParent(ent);
                data_obj_map.get(ent)['_parent'] = coll_parent === undefined ? '' : coll_parent;
            }
            i++;
        });
        attribs.forEach( (attrib, attrib_name) => {
            const data_size: number = attrib.getDataLength();
            for (const ent_i of Array.from(selected_ents.values())) {
                if (attrib_name.substr(0, 1) === '_') {
                    const attrib_value = attrib.getEntVal(ent_i);
                    data_obj_map.get(ent_i)[`${attrib_name}`] = attrib_value;
                } else {
                    const attrib_value = attrib.getEntVal(ent_i);
                    if ( data_size > 1 ) {
                        if (attrib_value === undefined) {
                            for (let idx = 0; idx < data_size; idx++) {
                                data_obj_map.get(ent_i)[`${attrib_name}[${idx}]`] = undefined;
                            }
                        } else if (attrib_value.constructor === {}.constructor) {
                            data_obj_map.get(ent_i)[`${attrib_name}`] = JSON.stringify(attrib_value);
                        } else {
                            (attrib_value as any[]).forEach( (v, idx) => {
                                const _v =  v;
                                data_obj_map.get(ent_i)[`${attrib_name}[${idx}]`] = _v;
                            });
                        }
                    } else {
                        if (ent_type === EEntType.POSI && Array.isArray(attrib_value)) {
                            if (attrib_value.length < 4) {
                                for (let index = 0; index < attrib_value.length; index++) {
                                    const _v = Array.isArray(attrib_value[index]) ?
                                    JSON.stringify(attrib_value[index]) : attrib_value[index];
                                    data_obj_map.get(ent_i)[`${attrib_name}[${index}]`] = _v;
                                }
                            } else {
                                data_obj_map.get(ent_i)[attrib_name] = JSON.stringify(attrib_value);
                            }
                        } else {
                            const _attrib_value = isString(attrib_value) ? `'${attrib_value}'` : attrib_value;
                            data_obj_map.get(ent_i)[`${attrib_name}`] = _attrib_value;
                        }
                    }
                }
            }
        });
        return Array.from(data_obj_map.values());
    }
}
