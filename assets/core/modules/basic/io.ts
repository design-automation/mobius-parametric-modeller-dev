/**
 * The `io` module has functions for importing and exporting.
 */

/**
 *
 */

import { GIModel } from '@libs/geo-info/GIModel';
import { importObj, exportObj } from '@libs/geo-info/io_obj';
import { importDae, exportDae } from '@libs/geo-info/io_dae';
import { importGeojson } from '@libs/geo-info/io_geojson';
import { download } from '@libs/filesys/download';
import { TId, EEntType, Txyz, TPlane, TRay, IGeomPack, IModelData, IGeomPackTId } from '@libs/geo-info/common';
import { __merge__ } from '../_model';
import { _model } from '..';
import { idsMake } from '@libs/geo-info/id';
import { arrMakeFlat } from '@assets/libs/util/arrs';

// ================================================================================================
declare global {
    interface Navigator {
        webkitPersistentStorage: {
            requestQuota: (a, b, c) => {}
        };
    }
}
// ================================================================================================
// Import / Export data types
export enum _EIODataFormat {
    GI = 'gi',
    OBJ = 'obj',
    GEOJSON = 'geojson'
}
export enum _EIODataSource {
    DEFAULT = 'From URL',
    FILESYS = 'From Local Storage'
}
export enum _EIODataTarget {
    DEFAULT = 'Save to Hard Disk',
    FILESYS = 'Save to Local Storage'
}
// ================================================================================================
/**
 * Read data from a Url or from local storage.
 *
 * @param data The data to be read (from URL or from Local Storage).
 * @returns the data.
 */
export function ReadData(__model__: GIModel, data: string): string {
    return data;
}
// ================================================================================================
/**
 * Save data to the hard disk or to the local storage.
 *
 * @param data The data to be saved (can be the url to the file).
 * @param file_name The name to be saved in the file system (file extension should be included).
 * @param data_target Enum, where the data is to be exported to.
 * @returns whether the data is successfully saved.
 */
export function WriteData(__model__: GIModel, data: string, file_name: string, data_target: _EIODataTarget): Boolean {
    try {
        if (data_target === _EIODataTarget.DEFAULT) {
            return download(data, file_name);
        }
        return saveResource(data, file_name);
    } catch (ex) {
        return false;
    }
}
// ================================================================================================
/**
 * Imports data into the model.
 * In order to get the model data from a file, you need to define the File or URL parameter
 * in the Start node of the flowchart.
 *
 * @param model_data The model data
 * @param data_format Enum, the file format.
 * @returns A list of the positions, points, polylines, polygons and collections added to the model.
 * @example util.ImportData (file1_data, obj)
 * @example_info Imports the data from file1 (defining the .obj file uploaded in 'Start' node).
 */
export function ImportToModel(__model__: GIModel, model_data: string, data_format: _EIODataFormat): IGeomPackTId {
    switch (data_format) {
        case _EIODataFormat.GI:
            return _importGI(__model__, model_data);
        case _EIODataFormat.OBJ:
            return _importObj(__model__, model_data);
        case _EIODataFormat.GEOJSON:
            return _importGeojson(__model__, model_data);
            break;
        default:
            throw new Error('Data type not recognised');
            break;
    }
}
function _importGI(__model__: GIModel, model_data: string): IGeomPackTId {
    // get number of ents before merge
    const num_ents_before: number[] = __model__.geom.query.numEntsAll(true);
    // import
    const gi_json: IModelData = JSON.parse(model_data) as IModelData;
    const gi_model: GIModel = new GIModel(gi_json);
    __model__.merge(gi_model);
    // get number of ents after merge
    const num_ents_after: number[] = __model__.geom.query.numEntsAll(true);
    // return the result
    return getNewTId(num_ents_before, num_ents_after);
}
function _importObj(__model__: GIModel, model_data: string): IGeomPackTId {
    // get number of ents before merge
    const num_ents_before: number[] = __model__.geom.query.numEntsAll(true);
    // import
    const obj_model: GIModel = importObj(model_data);
    __model__.merge(obj_model);
    // get number of ents after merge
    const num_ents_after: number[] = __model__.geom.query.numEntsAll(true);
    // return the result
    return getNewTId(num_ents_before, num_ents_after);
}
function _importGeojson(__model__: GIModel, model_data: string): IGeomPackTId {
    // get number of ents before merge
    const num_ents_before: number[] = __model__.geom.query.numEntsAll(true);
    // import
    importGeojson(__model__, model_data, 0);
    // get number of ents after merge
    const num_ents_after: number[] = __model__.geom.query.numEntsAll(true);
    // return the result
    return getNewTId(num_ents_before, num_ents_after);
}
function getNewTId(before: number[], after: number[]): IGeomPackTId {
    const posis_id: TId[] = [];
    const points_id: TId[] = [];
    const plines_id: TId[] = [];
    const pgons_id: TId[] = [];
    const colls_id: TId[] = [];
    for (let posi_i = before[0]; posi_i < after[0]; posi_i++) {
        posis_id.push( idsMake([EEntType.POSI,  posi_i]) as string );
    }
    for (let point_i = before[1]; point_i < after[1]; point_i++) {
        points_id.push( idsMake([EEntType.POINT,  point_i]) as string );
    }
    for (let pline_i = before[2]; pline_i < after[2]; pline_i++) {
        plines_id.push( idsMake([EEntType.PLINE,  pline_i]) as string );
    }
    for (let pgon_i = before[3]; pgon_i < after[3]; pgon_i++) {
        pgons_id.push( idsMake([EEntType.PGON,  pgon_i]) as string );
    }
    for (let coll_i = before[4]; coll_i < after[4]; coll_i++) {
        colls_id.push( idsMake([EEntType.COLL,  coll_i]) as string );
    }
    return {
        'ps': posis_id,
        'po': points_id,
        'pl': plines_id,
        'pg': pgons_id,
        'co': colls_id
    }
}
// ================================================================================================
export enum _EIOExportDataFormat {
    GI = 'gi',
    OBJ = 'obj',
    // DAE = 'dae',
    GEOJSON = 'geojson'
}
/**
 * Export data from the model as a file.
 * This will result in a popup in your browser, asking you to save the file.
 * @param __model__
 * @param entities Optional. Entities to be exported. If null, the whole model will be exported.
 * @param file_name Name of the file as a string.
 * @param data_format Enum, the file format.
 * @param data_target Enum, where the data is to be exported to.
 * @returns Boolean.
 * @example util.ExportData ('my_model.obj', obj)
 * @example_info Exports all the data in the model as an OBJ.
 */
export function ExportFromModel(__model__: GIModel, entities: TId|TId[]|TId[][],
        file_name: string, data_format: _EIOExportDataFormat, data_target: _EIODataTarget): boolean {
    if (entities !== null) {
        entities = arrMakeFlat(entities) as TId[];
    }
    // TODO implement export of entities
    switch (data_format) {
        case _EIOExportDataFormat.GI:
            let gi_data: string = JSON.stringify(__model__.getData());
            gi_data = gi_data.replace(/\\\"/g, '\\\\\\"'); // TODO temporary fix
            if (data_target === _EIODataTarget.DEFAULT) {
                return download(gi_data , file_name);
            }
            return saveResource(gi_data, file_name);
            break;
        case _EIOExportDataFormat.OBJ:
            const obj_data: string = exportObj(__model__, entities as TId[]);
            // obj_data = obj_data.replace(/#/g, '%23'); // TODO temporary fix
            if (data_target === _EIODataTarget.DEFAULT) {
                return download(obj_data , file_name);
            }
            return saveResource(obj_data, file_name);
            break;
        // case _EIOExportDataFormat.DAE:
        //     const dae_data: string = exportDae(__model__);
        //     // dae_data = dae_data.replace(/#/g, '%23'); // TODO temporary fix
        //     if (data_target === _EIODataTarget.DEFAULT) {
        //         return download(dae_data, file_name);
        //     }
        //     return saveResource(dae_data, file_name);
        //     break;
        // case _EIODataFormat.GEOJSON:
        //     const geojson_data: string = exportObj(__model__);
        //     return download(obj_data, filename);
        //     break;
        default:
            throw new Error('Data type not recognised');
            break;
    }
}

// ================================================================================================
/**
 * Functions for saving and loading resources to file system.
 */

function saveResource(file: string, name: string): boolean {
    const itemstring = localStorage.getItem('mobius_backup_list');
    if (!itemstring) {
        localStorage.setItem('mobius_backup_list', `["${name}"]`);
    } else {
        const items: string[] = JSON.parse(itemstring);
        let check = false;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item === name) {
                items.splice(i, 1);
                items.push(item);
                check = true;
                break;
            }
        }
        if (!check) {
            items.push(name);
            if (items.length > 5) {
                const item = items.shift();
                localStorage.removeItem(item);
            }
            localStorage.setItem('mobius_backup_list', JSON.stringify(items));
        }
    }
    const requestedBytes = 1024 * 1024 * 50;
    window['_code_'] = name;
    window['_file_'] = file;
    navigator.webkitPersistentStorage.requestQuota (
        requestedBytes, function(grantedBytes) {
            // @ts-ignore
            window.webkitRequestFileSystem(PERSISTENT, grantedBytes, saveToFS,
            function(e) { throw e; });
        }, function(e) { throw e; }
    );
    return true;
    // localStorage.setItem(code, file);
}

function saveToFS(fs) {
    fs.root.getFile(window['_code_'], { create: true}, function (fileEntry) {
        fileEntry.createWriter(function (fileWriter) {
            const bb = new Blob([window['_file_']], {type: 'text/plain;charset=utf-8'});
            fileWriter.write(bb);
            window['_code_'] = undefined;
            window['_file_'] = undefined;
        }, (e) => { console.log(e); });
    }, (e) => { console.log(e.code); });
}
