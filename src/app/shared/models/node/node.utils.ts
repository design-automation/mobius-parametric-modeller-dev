import { INode } from './node.interface';
import { ProcedureTypes, IFunction, IProcedure } from '@models/procedure';
import { InputType, PortUtils } from '@models/port';
import * as circularJSON from 'circular-json';
import { IdGenerator } from '@utils';
import { ModuleList, ModuleDocList } from '@shared/decorators';
import { _parameterTypes } from '@assets/core/_parameterTypes';

export abstract class NodeUtils {

    static getNewNode(): INode {
        const node: INode = <INode>{
            name: 'Node',
            id: IdGenerator.getNodeID(),
            position: {x: 0, y: 0},
            enabled: false,
            type: '',
            procedure: [{type: 13, ID: '',
                parent: undefined,
                meta: {name: '', module: ''},
                variable: undefined,
                children: undefined,
                argCount: 0,
                args: [],
                print: false,
                enabled: true,
                selected: false,
                selectGeom: false,
                hasError: false}],
            state: {
                procedure: [],
                input_port: undefined,
                output_port: undefined
            },
            input: PortUtils.getNewInput(),
            output: PortUtils.getNewOutput()
        };
        node.input.parentNode = node;
        node.output.parentNode = node;

        return node;
    }

    static getStartNode(): INode {
        const node = NodeUtils.getNewNode();
        // node.procedure = [];
        node.enabled = true;
        node.name = 'Start';
        node.type = 'start';
        return node;
    }

    static getEndNode(): INode {
        const node = NodeUtils.getNewNode();
        const returnMeta = _parameterTypes.return.split('.');
        let check = false;
        for (const i of ModuleList) {
            if (i.module !== returnMeta[0]) { continue; }
            for ( const j of i.functions) {
                if (j.name !== returnMeta[1]) { continue; }
                const newReturn = {
                    type: 11,
                    ID: 'Return',
                    parent: undefined,
                    meta: {name: '', module: ''},
                    children: undefined,
                    variable: undefined,
                    argCount: j.argCount,
                    args: j.args,
                    print: false,
                    enabled: true,
                    selected: false,
                    selectGeom: false,
                    hasError: false
                };

                for (const arg of newReturn.args) {
                    arg.value = '';
                    arg.jsValue = '';
                }
                node.procedure.push(newReturn);
                check = true;
                break;
            }
            break;
        }
        if (!check) {
            console.log('CORE FUNCTION ERROR: Unable to retrieve return procedure, please check "Return" in _ParameterTypes.ts');
        }
        // node.procedure = [];
        node.name = 'End';
        node.type = 'end';
        return node;
    }


    static deselect_procedure(node: INode) {
        for (const prod of node.state.procedure) {
            prod.selected = false;
        }
        node.state.procedure = [];
    }


    static rearrangeProcedures(prodList: IProcedure[], tempList: IProcedure[], prods: IProcedure[]) {
        for (const pr of prods) {
            let i = 0;
            while (i < tempList.length) {
                if (tempList[i].ID === pr.ID) {
                    prodList.push(pr);
                    tempList.splice(i, 1);
                    break;
                }
                i += 1;
            }
            if (pr.children) { NodeUtils.rearrangeProcedures(prodList, tempList, pr.children); }
        }
    }

    static select_procedure(node: INode, procedure: IProcedure, ctrl: boolean, shift: boolean) {
        if (!procedure) {
            return;
        }
        if (ctrl) {
            let selIndex = 0;
            let selected = false;
            while (selIndex < node.state.procedure.length) {
                if (node.state.procedure[selIndex] === procedure) {
                    selected = true;
                    node.state.procedure.splice(selIndex, 1);
                    procedure.selected = false;
                    return false;
                }
                selIndex += 1;
            }
            if (!selected) {
                procedure.selected = true;
                node.state.procedure.push(procedure);
            }
        } else if (shift) {
            if (node.state.procedure.length === 0) {
                node.state.procedure.push(procedure);
                procedure.selected = true;
                return;
            } else if (procedure.selected) {
                procedure.selected = false;
                const i = node.state.procedure.indexOf(procedure);
                if (i !== -1) {
                    node.state.procedure.splice(i, 1);
                    return;
                }
            }
            // fromProd: the last selected procedure
            let fromProd = node.state.procedure[node.state.procedure.length - 1];
            // find the whole path to the fromProd from the base level
            const fromTree = [fromProd];
            while (fromProd.parent) {
                fromProd = fromProd.parent;
                fromTree.unshift(fromProd);
            }
            // toProd: the procedure that was shift + clicked on
            let toProd = procedure;
            // find the whole path to the toProd from the base level
            const toTree = [procedure];
            while (toProd.parent) {
                toProd = toProd.parent;
                toTree.unshift(toProd);
            }

            // removing the common parents in the fromProd-toProd path
            // env would be the list of procedure containing the first different parents between fromProd and toProd
            let env = node.procedure;
            while (fromTree[0] === toTree[0]) {
                env = fromTree[0].children;
                fromTree.splice(0, 1);
                toTree.splice(0, 1);
            }

            // find the indices of the first different parents of fromProd and toProd
            const fromIndex = env.indexOf(fromTree[0]);
            const toIndex = env.indexOf(toTree[0]);

            // check the direction from fromProd to toProd
            // reverse = false: fromProd is above toProd
            // reverse = true : fromProd is below toProd
            const reverse = fromIndex < toIndex ? false : true;

            // add the procedures between fromProd and toProd that are inside the fromTree
            while (fromTree.length > 1) {
                fromProd = fromTree.pop();
                const prodList = fromProd.parent.children;
                if (!reverse) {
                    // add procedure from the fromProcedure to the end, not inclusive of the fromProcedure
                    // since it is already selected
                    for (let i = prodList.indexOf(fromProd) + 1; i < prodList.length; i++) {
                        prodList[i].selected = true;
                        node.state.procedure.push(prodList[i]);
                    }
                } else {
                    // add procedure from the fromProcedure to the beginning,
                    // not inclusive of the fromProcedure since it is already selected.
                    // stop adding procedure when at index 1,
                    // procedure at index 0 is not added to the list since it is always a blank
                    for (let i = prodList.indexOf(fromProd) - 1; i > 0; i--) {
                        prodList[i].selected = true;
                        node.state.procedure.push(prodList[i]);
                    }
                }
            }

            // add the procedure between the first different parents of the fromProd and toProd
            if (!reverse) {
                for (let i = fromIndex + 1; i < toIndex; i++) {
                    env[i].selected = true;
                    node.state.procedure.push(env[i]);
                }
            } else {
                for (let i = fromIndex - 1; i > toIndex; i--) {
                    env[i].selected = true;
                    node.state.procedure.push(env[i]);
                }
            }

            // add the procedures between fromProd and toProd that are inside the toTree
            for (let ind = 1; ind < toTree.length; ind++) {
                toProd = toTree[ind];
                const prodList = toProd.parent.children;
                if (!reverse) {

                    // procedure at index 0 is not added to the list since it is always a blank
                    for (let i = prodList.indexOf(toProd) - 1; i > 0; i--) {
                        prodList[i].selected = true;
                        node.state.procedure.push(prodList[i]);
                    }
                } else {
                    for (let i = prodList.indexOf(toProd) + 1; i < prodList.length; i++) {
                        prodList[i].selected = true;
                        node.state.procedure.push(prodList[i]);
                    }
                }
            }

            // add the toProd itself
            procedure.selected = true;
            node.state.procedure.push(procedure);

        } else {
            const sel = procedure.selected;
            for (const prod of node.state.procedure) {
                prod.selected = false;
            }
            if (sel && node.state.procedure.length === 1 && node.state.procedure[node.state.procedure.length - 1] === procedure) {
                node.state.procedure = [];
            } else {
                node.state.procedure = [procedure];
                procedure.selected = true;
            }
        }
    }

    static insert_procedure(node: INode, prod: IProcedure) {
        if (prod.type === ProcedureTypes.Constant) {
            if (node.type !== 'start') { return; }
            if (node.state.procedure[node.state.procedure.length - 1]) {
                if (node.state.procedure[node.state.procedure.length - 1].type === ProcedureTypes.Constant) {
                    for (const index in node.procedure) {
                        if (node.procedure[index].selected) {
                            node.procedure.splice(parseInt(index, 10) + 1, 0, prod);
                            break;
                        }
                    }
                } else {
                    let addCheck = false;
                    for (const index in node.procedure) {
                        if (node.procedure[index].type === ProcedureTypes.Constant) {
                            node.procedure.splice(parseInt(index, 10), 0, prod);
                            addCheck = true;
                            break;
                        }
                    }
                    if (!addCheck) {
                        node.procedure.push(prod);
                    }
                }
            } else {
                node.procedure.push(prod);
            }
            return;
        }
        const lastNode = node.state.procedure[node.state.procedure.length - 1];
        if (lastNode &&
            lastNode.type !== ProcedureTypes.Constant) {
            let list: IProcedure[];
            if (lastNode.parent) {
                prod.parent = lastNode.parent;
                list = prod.parent.children;
            } else {
                list = node.procedure;
            }
            for (const index in list) {
                if (list[index].ID === lastNode.ID) {
                    list.splice(parseInt(index, 10) + 1, 0, prod);
                    break;
                }
            }

        } else {
            if (node.type === 'end') {
                node.procedure.splice( node.procedure.length - 1, 0, prod);
                return;
            } else if (node.type === 'start') {
                for (let i = 0; i < node.procedure.length; i++) {
                    if (node.procedure[i].type === ProcedureTypes.Constant ) {
                        node.procedure.splice( i, 0, prod);
                        return;
                    }
                }
                node.procedure.push(prod);
                return;
            }
            node.procedure.push(prod);
        }
    }

    static initiateChildren(prod) {
        prod.children = [
            {type: 13, ID: '',
            parent: prod, meta: {name: '', module: ''},
            children: undefined,
            variable: undefined,
            argCount: 0,
            args: [],
            print: false,
            enabled: true,
            selected: false,
            selectGeom: false,
            hasError: false}
        ];
    }
    static add_procedure(node: INode, type: ProcedureTypes, data: any) {
        const prod: IProcedure = <IProcedure>{};
        prod.type = type;

        NodeUtils.insert_procedure(node, prod);

        // add ID to the procedure
        prod.ID = IdGenerator.getProdID();
        prod.enabled = true;
        prod.print = false;


        switch (prod.type) {
            case ProcedureTypes.Variable:
                prod.argCount = 2;
                prod.args = [
                    {name: 'var_name', value: undefined},
                    {name: 'value', value: undefined} ];
                break;

            case ProcedureTypes.Foreach:
                prod.argCount = 2;
                prod.args = [ {name: 'item', value: undefined}, {name: 'list', value: undefined} ];
                this.initiateChildren(prod);
                break;

            case ProcedureTypes.While:
                prod.argCount = 1;
                prod.args = [ {name: 'condition', value: undefined} ];
                this.initiateChildren(prod);
                break;

            case ProcedureTypes.If:
            case ProcedureTypes.Elseif:
                prod.argCount = 1;
                prod.args = [ {name: 'condition', value: undefined} ];
                this.initiateChildren(prod);
                break;

            case ProcedureTypes.Else:
                prod.argCount = 0;
                prod.args = [];
                this.initiateChildren(prod);
                break;

            case ProcedureTypes.Break:
            case ProcedureTypes.Continue:
                prod.argCount = 0;
                prod.args = [];
                break;

            case ProcedureTypes.Constant:
                prod.argCount = 2;
                prod.meta = { module: 'Input', name: 'Constant', inputMode: data, description: ''};
                prod.args = [
                {name: 'const_name', value: undefined},
                {name: '__input__', value: 0} ];
            break;

            case ProcedureTypes.AddData:
                prod.argCount = 2;
                prod.meta = { module: 'Input', name: 'Constant', inputMode: InputType.SimpleInput, description: undefined};
                prod.args = [
                {name: 'const_name', value: undefined},
                {name: '__input__', value: undefined} ];
            break;

            case ProcedureTypes.Comment:
                prod.argCount = 1;
                prod.args = [{name: 'comment', value: undefined}];
            break;

            case ProcedureTypes.Terminate:
                prod.argCount = 0;
                prod.args = [];
            break;

            case ProcedureTypes.Return:
                prod.meta = { module: 'Output', name: 'Return', description: undefined};
                prod.argCount = 1;
                prod.args = [ {name: 'index', value: undefined} ];
                break;

            case ProcedureTypes.Function:
                if (!data) { throw Error('No function data'); }
                console.log(JSON.stringify(data));
                prod.meta = { module: data.module, name: data.name};
                prod.argCount = data.argCount + 1;
                let returnArg = {name: 'var_name', value: undefined};
                if (!data.hasReturn) {
                    returnArg = {name: '__none__', value: undefined};
                }

                prod.args = [ returnArg, ...data.args];
                break;

            case ProcedureTypes.Imported:
                prod.meta = { module: data.module, name: data.name};
                prod.argCount = data.argCount + 1;

                let iReturnArg = {name: 'var_name', value: undefined};
                if (!data.hasReturn) {
                    iReturnArg = {name: '__none__', value: undefined};
                }

                prod.args = [ iReturnArg, ...data.args];
                break;
        }
        // select the procedure
        if (prod.children) {
            NodeUtils.select_procedure(node, prod.children[0], false, false);
        } else {
            NodeUtils.select_procedure(node, prod, false, false);
        }
    }

    static updateNode(newNode: INode, newPos): INode {
        newNode.id = IdGenerator.getNodeID();
        newNode.input = PortUtils.getNewInput();
        newNode.output = PortUtils.getNewOutput();
        newNode.input.parentNode = newNode;
        newNode.output.parentNode = newNode;
        newNode.position.x = newPos.x;
        newNode.position.y = newPos.y;
        return newNode;
    }

    static updateID(prod: IProcedure): any {
        if (prod.hasOwnProperty('children')) {
            prod.children.map((child: IProcedure) => {
                NodeUtils.updateID(child);
            });
        }
        prod.ID = IdGenerator.getProdID();
        NodeUtils.resetSelectGeom(prod);
        return prod;
    }

    static resetSelectGeom(prod: IProcedure) {
        prod.selectGeom = false;
        if (prod.children) {
            for (const chl of prod.children) {
                NodeUtils.resetSelectGeom(chl);
            }
        }
    }

    static paste_procedure(node: INode, prod: IProcedure ): boolean {
        if (NodeUtils.checkInvalid(ProcedureTypes[prod.type], node)) {
            return false;
        }
        const newProd = NodeUtils.updateID(circularJSON.parse(circularJSON.stringify(prod)));
        newProd.parent = undefined;
        NodeUtils.insert_procedure(node, newProd);
        NodeUtils.select_procedure(node, newProd, false, false);
        return true;
    }

    static checkInvalid(type: string, node: INode) {
        const tp = type.toUpperCase();
        if (tp === 'ELSE') {
            if (node.state.procedure.length === 0) { return true; }
            const checkNode = node.state.procedure[node.state.procedure.length - 1];
            if (checkNode.type.toString() !== ProcedureTypes.If.toString()
            && checkNode.type.toString() !== ProcedureTypes.Elseif.toString()) {
                return true;
            }
            let prods: IProcedure[];

            if (checkNode.parent) { prods = checkNode.parent.children;
            } else { prods = node.procedure; }

            for (let i = 0 ; i < prods.length - 1; i++) {
                if (prods[i].ID === checkNode.ID) {
                    if (prods[i + 1].type.toString() === ProcedureTypes.Elseif.toString() ||
                    prods[i + 1].type.toString() === ProcedureTypes.Else.toString()) {
                        return true;
                    }
                    return false;
                }
            }
            return false;
        } else if (tp === 'ELSEIF') {
            if (node.state.procedure.length === 0) { return true; }
            const checkNode = node.state.procedure[node.state.procedure.length - 1];
            return (checkNode.type.toString() !== ProcedureTypes.If.toString()
            && checkNode.type.toString() !== ProcedureTypes.Elseif.toString());
        } else {
            let checkNode = node.state.procedure[node.state.procedure.length - 1];
            if (tp === 'BREAK' || tp === 'CONTINUE') {
                if (!checkNode) {return true; }
                while (checkNode.parent) {
                    if (checkNode.parent.type.toString() === ProcedureTypes.Foreach.toString() ||
                    checkNode.parent.type.toString() === ProcedureTypes.While.toString()) {
                        return false;
                    }
                    checkNode = checkNode.parent;
                }
                return true;
            }

            if (checkNode) {
                let prods: IProcedure[];

                if (checkNode.parent) { prods = checkNode.parent.children;
                } else { prods = node.procedure; }

                if (checkNode.type.toString() === ProcedureTypes.If.toString()
                || checkNode.type.toString() === ProcedureTypes.Elseif.toString()) {
                    for (let i = 0 ; i < prods.length - 1; i++) {
                        if (prods[i].ID === checkNode.ID) {
                            if (prods[i + 1].type.toString() === ProcedureTypes.Else.toString()
                            || prods[i + 1].type.toString() === ProcedureTypes.Elseif.toString()) {
                                return true;
                            }
                            return false;
                        }
                    }
                }
            }


        }
        return false;
    }
}
