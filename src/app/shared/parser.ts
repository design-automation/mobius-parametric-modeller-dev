import { inline_func } from '@assets/core/inline/inline';
import { IProcedure, ProcedureTypes } from '@models/procedure';
import { IArgument } from '@models/code';
import { INode } from '@models/node';

enum strType {
    NUM,
    VAR,
    STR,
    OTHER
}

const mathOperators = new Set(['+', '*', '/', '%']);
const binaryOperators = new Set([   '+' , '+=' , '-=', '*' , '/' , '%'  , '<' , '<=',
                                    '==', '===', '>' , '>=', '!=', '!==', '&&', '||']);

const postfixUnaryOperators = new Set(['++', '--']);
const prefixUnaryOperators = new Set(['-', '!']);

const componentStartSymbols = new Set(['-', '!', '(', '[', '{', '#', '@']);

const otherSymbols = new Set(['.', '#', ',']);

const noSpaceBefore = new Set(['@', ',', ']', '[']);

const allConstants = (<string[][]>inline_func[0][1]).map(constComp => constComp[0]);

const reservedWords = [
    'abstract', 'arguments', 'await', 'boolean',
    'break', 'byte', 'case', 'catch',
    'char', 'class', 'const', 'continue',
    'debugger', 'default', 'delete', 'do',
    'double', 'else', 'enum', 'eval',
    'export', 'extends', 'false', 'final',
    'finally', 'float', 'for', 'function',
    'goto', 'if', 'implements', 'import',
    'in', 'instanceof', 'int', 'interface',
    'let', 'long', 'native', 'new',
    'null', 'package', 'private', 'protected',
    'public', 'return', 'short', 'static',
    'super', 'switch', 'synchronized', 'this',
    'throw', 'throws', 'transient', 'true',
    'try', 'typeof', 'var', 'void',
    'volatile', 'while', 'with', 'yield',

    'Array', 'Date', 'hasOwnProperty', 'Infinity',
    'isFinite', 'isNaN', 'isPrototypeOf', 'length',
    'Math', 'NaN', 'name', 'Number', 'Object',
    'prototype', 'String', 'toString', 'undefined', 'valueOf'
];

const mathFuncs = [];
for (const funcMod of inline_func) {
    for (const func of funcMod[1]) {
        mathFuncs.push(func[0].split('(')[0]);
    }
}


let globals = [];

export function updateGlobals(startNode: INode) {
    globals = [];
    for (let i = startNode.procedure.length - 1; i > -1; i-- ) {
        const prod = startNode.procedure[i];
        if (prod.type !== ProcedureTypes.Constant) { return; }
        globals.push(prod.args[0].value);
    }
}

export function modifyVar(procedure: IProcedure, nodeProdList: IProcedure[]) {
    if (!procedure.args[0].value) { return; }
    procedure.args[0].value = modifyVarArg(procedure.args[0]);

    const modifiedVar = parseVariable(procedure.args[0].value);
    if (modifiedVar.error) {
        procedure.args[0].invalidVar = modifiedVar.error;
        return;
    }
    if (modifiedVar.declaredVar) {
        procedure.variable = modifiedVar.declaredVar;
        if (globals.indexOf(procedure.variable) !== -1) {
            procedure.args[0].invalidVar = `Error: Variable shadowing global constant: ${procedure.variable}`;
            return;
        }
    }
    if (modifiedVar.usedVars) {
        const result = checkValidVar(modifiedVar.usedVars, procedure, nodeProdList);
        if (!result.error) {
            procedure.args[0].usedVars = result.vars;
        } else {
            procedure.args[0].invalidVar = result.error;
            return;
        }
    }
    procedure.args[0].invalidVar = false;
}

export function modifyVarArg(arg: IArgument) {
    let str = arg.value.trim();
    str = str.replace(/ /g, '_');
    str = str.toLowerCase();
    if ((str.match(/\[/g) || []).length !== (str.match(/\]/g) || []).length) {
        arg.invalidVar = true;
        return str;
    }
    const strSplit = str.split(/[\@\[\]]/g);
    let teststr = str;
    for (const i of strSplit) {
        if (i === '') { continue; }
        if (i === '0' || Number(i)) {
            const sStr = `[${i}]`;
            const ind = teststr.indexOf(sStr);
            if (ind === -1) {
                arg.invalidVar = true;
                return str;
            }
            teststr = teststr.slice(0, ind) + teststr.slice(ind + sStr.length);
            continue;
        }
        try {
            if (i[0] === '_') {
                arg.invalidVar = true;
                return str;
            }
            for (const reserved of reservedWords) {
                if (i === reserved) {
                    arg.invalidVar = true;
                    return str;
                }
            }
            for (const funcName of mathFuncs) {
                if (i === funcName) {
                    arg.invalidVar = true;
                    return str;
                }
            }
            let currentWindow;
            if (window.hasOwnProperty(i)) {
                currentWindow = window[i];
            }
            const fn = new Function('', `${i}=1;`);
            fn();
            delete window[i];
            if (currentWindow) {
                window[i] = currentWindow;
            }

            arg.invalidVar = false;
        } catch (ex) {
            arg.invalidVar = true;
            return str;
        }
    }
    return str;
}

export function modifyArgument(procedure: IProcedure, argIndex: number, nodeProdList: IProcedure[]) {
    if (!procedure.args[argIndex].value) { return; }
    // PARSER CALL
    let varResult = parseArgument(procedure.args[argIndex].value);

    // if (varResult.str !== procedure.args[argIndex].value) {
    //     console.log('', varResult.str, '\n', procedure.args[argIndex].value);
    // }
    // console.log( varResult.str === procedure.args[argIndex].value, varResult.str, procedure.args[argIndex].value);
    // console.log( varResult.str);

    // return;
    if (varResult.error) {
        procedure.args[argIndex].invalidVar = varResult.error;
        return;
    }

    procedure.args[argIndex].value = varResult.str;
    varResult = checkValidVar(varResult.vars, procedure, nodeProdList);
    if (!varResult.error) {
        procedure.args[argIndex].usedVars = varResult.vars;
        procedure.args[argIndex].invalidVar = false;
    } else {
        procedure.args[argIndex].invalidVar = varResult.error;
    }

    // REGEX CALL
    // const vals = procedure.args[argIndex].value.split('"');
    // let result = '';
    // let startOnEven = true;
    // for (let i = 0; i < vals.length; i += 2) {
    //     if (i > 0) {
    //         if (startOnEven) {
    //             result += ' "' + vals[i - 1] + '" ';
    //         } else {
    //             result += '"' + vals[i - 1] + '"';
    //         }
    //     }
    //     const valSplit = vals[i].split(`'`);
    //     for (let j = startOnEven ? 0 : 1; j < valSplit.length; j += 2) {
    //         if (j === 1) {
    //             result += valSplit[0] + `' `;
    //         } else if (j > 1) {
    //             result += ` '` + valSplit[j - 1] + `' `;
    //         }
    //         result += valSplit[j].replace(
    //             /\s*([\[\]])\s*/g, '$1').replace(
    //             /([\+\-\*\/\%\{\}\(\)\,\<\>\=\!])/g, ' $1 ')
    //             .replace(/([\<\>\=\!])\s+=/g, '$1=')
    //             .trim().replace(/\s{2,}/g, ' ');
    //         if (j === valSplit.length - 2 ) {
    //             result += ` '` + valSplit[j + 1];
    //         }
    //     }
    //     if (valSplit.length % 2 === 0) {
    //         startOnEven = !startOnEven;
    //     }

    //     if (i === vals.length - 2 ) {
    //         result += ' "' + vals[i + 1] + '" ';
    //     }
    // }
    // procedure.args[argIndex].value = result.trim();
}

// VAR INPUT
export function parseVariable(value: string): {'error'?: string, 'declaredVar'?: string, 'usedVars'?: string[]} {
    let str = value.trim();
    // str = str.replace(/ /g, '_');
    str = str.toLowerCase();
    const comps = splitComponents(str);
    if (typeof comps === 'string') {
        return {'error': comps};
    }

    if (comps[0].value === '@') {
        if (comps[1].type !== strType.VAR) {
            return {'error': 'Error: Expect attribute name after @'};
        }
        return {};
    }
    if (comps[0].type !== strType.VAR) {
        return {'error': `Error: Expect a Variable at the start of the input`};
    }
    if (comps.length === 1) {
        return {'declaredVar': comps[0].value};
    }

    const vars = [];
    const check = analyzeVar(comps, 0, vars, false);
    if (check.error) {
        console.log(check.error, '\n', str);
        return check;
    }
    if (check.i !== comps.length - 1) {
        console.log('..... Var', check.i, comps.length);
        return {'error': `Error: Invalid "${comps[check.i + 1].value}"` +
        `at: ... ${comps.slice(check.i + 1).map(cp => cp.value).join(' ')}`};
    }
    return {'usedVars': [comps[0].value]};

    // if (comps[1].value === '[') {
    //     let i = 1;
    //     const openBrackets = [0, 0, 0]; // [roundBracketCount, squareBracketCount, curlyBracketCount]
    //     const vars: string[] = [];
    //     while (i < comps.length && comps[i].value !== ']') {
    //         const check = analyzeComponent(comps, i, openBrackets, vars);
    //         if (check.error) {
    //             return check;
    //         }
    //         i = check.value;
    //     }
    //     if (i !== comps.length - 1) {
    //         if (comps[i + 1].value !== '@') {
    //             return {'error': 'Error: Expect ] at the end of the variable'};
    //         }
    //         if (!comps[i + 2] || comps[i + 2].type !== strType.VAR) {
    //             return {'error': 'Error: Expect attribute name after @'};
    //         }
    //     }
    //     addVars(vars, comps[0].value);
    //     return {'usedVars': vars};
    // }
    // if (comps[1].value === '@') {
    //     if (comps[2].type !== strType.VAR) {
    //         return {'error': 'Error: Expect attribute name after @'};
    //     }
    //     return {'usedVars': [comps[0].value]};
    // }
    // if (comps[1].value === '.') {
    //     if (comps[2].type !== strType.VAR) {
    //         return {'error': 'Error: Expect attribute name after .'};
    //     }
    //     return {'usedVars': [comps[0].value]};
    // }
}


// NEW ARGUMENT INPUT
export function parseArgument(str: string): {'error'?: string, 'vars'?: string[], 'str'?: string} {
    // console.log('_____',str);
    const comps = splitComponents(str);
    if (typeof comps === 'string') {
        return {'error': comps};
    }
    // console.log(comps);
    const vars: string[] = [];
    let newString = '';
    const check = analyzeComp(comps, 0, vars);
    if (check.error) {
        console.log(check.error, '\n', str);
        return check;
    }
    newString += check.str;
    if (check.i !== comps.length - 1) {
        console.log('..... Arg', newString, str, check.i, comps.length);
        return {'error': `Error: Invalid "${comps[check.i + 1].value}"` +
        `at: ... ${comps.slice(check.i + 1).map(cp => cp.value).join(' ')}`};
    }
    return {'vars': vars, 'str': newString.trim()};
}

function analyzeComp(comps: {'type': strType, 'value': string}[], i: number, vars: string[],
                    noSpace?: boolean, expressionType?: string):
                {'error'?: string, 'i'?: number, 'value'?: number, 'str'?: string} {
    // console.log('analyzeComp |||', comps.slice(i).map(x => x.value).join(' '));
    let newString = '';

    // if variable ==> go to analyzeVar
    if (comps[i].type === strType.VAR) {
        const result = analyzeVar(comps, i, vars, false);
        if (result.error) { return result; }
        i = result.i;
        newString += result.str;

    // if number/string ==> basic
    } else if (comps[i].type === strType.NUM || comps[i].type === strType.STR) {
        newString += comps[i].value;

    // if "-" or "!" add the operator then analyzeComp the next
    } else if (prefixUnaryOperators.has(comps[i].value)) {
        newString += comps[i].value; //////////
        if (i + 1 === comps.length) {
            return {'error': 'Error: Expressions expected after "-"\n' +
            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
        }
        const result = analyzeComp(comps, i + 1, vars);
        if (result.error) { return result; }
        i = result.i;
        newString += result.str;

    // if '(' ==> calculation ==> analyze comp (first component inside the bracket)
    } else if (comps[i].value === '(') {
        if (i + 1 === comps.length) {
            return {'error': 'Error: Expressions expected after "("\n' +
            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
        }
        const result = analyzeComp(comps, i + 1, vars);
        if (result.error) { return result; }
        if (result.i + 1 >= comps.length || comps[result.i + 1].value !== ')') {
            return {'error': 'Error: Closing Bracket ")" expected\n' +
            `at: ... ${comps.slice(result.i + 1).map(cp => cp.value).join(' ')}`};
        }
        i = result.i + 1;
        newString += `(${result.str})`; //////////

    // if '[' ==> array
    } else if (comps[i].value === '[') {
        if (comps[i + 1].value === ']') {
            newString += `[]`;
            i += 1;
        } else {
            const result = analyzeArray(comps, i + 1, vars);
            if (result.error) { return result; }
            if (result.i + 1 >= comps.length || comps[result.i + 1].value !== ']') {
                return {'error': 'Error: Closing Bracket "]" expected\n' +
                `at: ... ${comps.slice(result.i + 1).map(cp => cp.value).join(' ')}`};
            }
            i = result.i + 1;
            newString += `[${result.str}]`; //////////
        }
    // if '{' ==> JSON
    } else if (comps[i].value === '{') {
        const result = analyzeJSON(comps, i + 1, vars);
        if (result.error) { return result; }
        if (result.i + 1 >= comps.length || comps[result.i + 1].value !== '}') {
            return {'error': 'Error: Closing Bracket "}" expected\n' +
            `at: ... ${comps.slice(result.i + 1).map(cp => cp.value).join(' ')}`};
        }
        i = result.i + 1;
        newString += `{${result.str}}`; //////////

    // if "#" ==> #@variable
    } else if (comps[i].value === '#') {
        if (i + 1 === comps.length || comps[i + 1].value !== '@') {
            return {'error': 'Error: "@" expected after "#"\n' +
            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
        }
        if (i + 2 === comps.length || comps[i + 2].type !== strType.VAR) {
            return {'error': 'Error: Variable expected after "#@"\n' +
            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
        }
        const result = analyzeVar(comps, i + 2, vars, true);
        if (result.error) { return result; }
        i = result.i;
        newString += ' #@' + result.str.replace(/ /g, '') + ' '; //////////

    // if "@" ==> @variable
    } else if (comps[i].value === '@') {
        if (i + 1 === comps.length || comps[i + 1].type !== strType.VAR) {
            return {'error': 'Error: Variable expected after "@"\n' +
            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
        }
        const result = analyzeVar(comps, i + 1, vars, true);
        if (result.error) { return result; }
        i = result.i;
        newString = ' @' + result.str.replace(/ /g, '') + ' '; //////////
    }

    if (i + 1 >= comps.length) { return {'i': i, 'str': newString}; }

    let nextComp = comps[i + 1];
    // if the next component is '++' or '--', add it in and continue to the next one
    if (postfixUnaryOperators.has(nextComp.value)) {
        newString += nextComp.value;
        i += 1;
        if (i === comps.length) { return {'i': i, 'str': newString}; }
        nextComp = comps[i + 1];
    }

    // if it is in an expression or array, return here
    if ((expressionType === 'array' && nextComp.value === ',') || expressionType === 'expr') {
        return {'i': i, 'str': newString};
    }

    // if next comp is Variable/String/Number, not allowed
    if (nextComp.type !== strType.OTHER ) {
        return {'error': 'Error: Variable/String/Number after Variable/String/Number\n' +
                `at: ... ${comps.slice(i - 1).map(cp => cp.value).join(' ')}`};
    }

    // if next comp is "," or ")" or "]" or "}", return
    if (nextComp.value === ',' || nextComp.value === ')' || nextComp.value === ']' || nextComp.value === '}') {
        return {'i': i, 'str': newString};

    // if next comp is '-' or any other binary operators, continue to analyzeExpression
    } else if (nextComp.value === '-' || binaryOperators.has(nextComp.value)) {
        const result = analyzeExpression(comps, i + 1, vars);
        if (result.error) { return result; }
        i = result.i;
        if (newString[newString.length - 1] === ' ' && result.str[0] === ' ') {
            newString += result.str.substring(1);
        } else {
            newString += result.str;
        }
    }
    return {'i': i, 'str': newString};
}

function analyzeVar(comps: {'type': strType, 'value': string}[], i: number, vars: string[],
                    disallowAt: boolean):
                    {'error'?: string, 'i'?: number, 'value'?: number, 'str'?: string} {
    // console.log('analyzeVar |||', comps.slice(i).map(x => x.value).join(' '));
    const comp = comps[i];
    let newString = comp.value;
    // if variable is the last component
    // add the variable to the var list
    if (i + 1 === comps.length) {
        if (!disallowAt) {
            addVars(vars, comp.value);
        }
        return {'i': i, 'str': newString};
    }
    // if variable is followed immediately by another var/num/str --> not allowed
    if ( comps[i + 1].type !== strType.OTHER ) {
        return { 'error': 'Error: Variable followed by another variable/number/string \n' +
        `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};

    // if variable is followed by "[" --> array/json
    // add the variable to var list and check for validity of the first component inside the bracket
    } else if (comps[i + 1].value === '[' || comps[i + 1].value === '.') {
        if (!disallowAt) {
            addVars(vars, comp.value);
        }
        while (i + 1 < comps.length && (comps[i + 1].value === '[' || comps[i + 1].value === '.')) {
            if (comps[i + 1].value === '[') {
                const result = analyzeComp(comps, i + 2, vars);
                if (result.error) { return result; }
                if (result.i + 1 >= comps.length || comps[result.i + 1].value !== ']') {
                    return { 'error': `Error: "]" expected \n
                    at: ... ${comps.slice(result.i + 1).map(cp => cp.value).join(' ')}`};
                }
                i = result.i + 1;
                newString += '[' + result.str + ']';
            } else {
                i = i + 2;
                if (comps[i].type !== strType.VAR) {
                    return { 'error': `Error: attribute name expected \n
                    at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
                }
                newString += '.' + comps[i].value;
            }
        }

    // if variable is followed by "(" --> function
    // does not add to the var list since it's function name
    } else if (comps[i + 1].value === '(') {
        if (comps[i + 2].value === ')') {
            i++;
            newString += '()';
        } else {
            const result = analyzeArray(comps, i + 2, vars);
            if (result.error) { return result; }
            if (result.i + 1 >= comps.length || comps[result.i + 1].value !== ')') {
                return { 'error': `Error: ")" expected \nat: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`}; }
            i = result.i + 1;
            newString += `(${result.str})`;
            return {'i': i, 'str': newString};
        }
    // if variable is followed by "{" --> not allowed
    } else if (comps[i + 1].value === '{') {
        return { 'error': 'Error: Variable followed by "{" \n' +
        `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};

    // // if variable is followed by "#" / "." / ")" / "]" / "}"
    // } else if (otherSymbols.has(comps[i + 1].value) ||
    //            comps[i + 1].value === ')' ||
    //            comps[i + 1].value === ']' ||
    //            comps[i + 1].value === '}') {
    //     if (comps[i + 1].value === '#') {
    //         return { 'error': `Error: Variable followed by "${comps[i + 1].value}" \n` +
    //         `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
    //     }
    //     addVars(vars, comp.value);
    //     i += 1;

    // all other cases
    } else if (!disallowAt) {
        addVars(vars, comp.value);
    }

    if (i + 1 < comps.length && comps[i + 1].value === '@') {
        if (disallowAt) {
            return { 'error': 'Error: Invalid "@"\n' +
            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
        }
        if (comps[i + 2].type !== strType.VAR) {
            return {'error': 'Error: Variable expected after "@"\n' +
            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
        }
        const result = analyzeVar(comps, i + 2, vars, true);
        if (result.error) { return result; }
        i = result.i;
        newString = ' ' + newString.replace(/ /g, '') + '@' + result.str.replace(/ /g, '') + ' '; //////////
    }
    return {'i': i, 'str': newString};
}

function analyzeArray(comps: {'type': strType, 'value': string}[], i: number, vars: string[]):
                {'error'?: string, 'i'?: number, 'value'?: number, 'str'?: string} {
    // console.log('analyzeArray |||', comps.slice(i).map(x => x.value).join(' '));
    if (comps[i].type === strType.OTHER && !componentStartSymbols.has(comps[i].value)) {
        return {'i': i, 'str': ''};
    }
    const firstComp = analyzeComp(comps, i, vars, false, 'array');
    if (firstComp.error) { return firstComp; }
    i = firstComp.i + 1;
    let newString = firstComp.str;

    while (i < comps.length && comps[i].value === ',') {
        newString += comps[i].value;
        const result = analyzeComp(comps, i + 1, vars, false, 'array');
        if (result.error) { return result; }
        i = result.i + 1;
        if (result.str[0] !== ' ') { newString += ' '; }
        newString += result.str;
    }
    // console.log('~',i, comps.length, newString)
    return {'i': i - 1, 'str': newString};
}


function analyzeJSON(comps: {'type': strType, 'value': string}[], i: number, vars: string[]):
                {'error'?: string, 'i'?: number, 'value'?: number, 'str'?: string} {
    if (comps[i].type !== strType.STR) {
        return {'i': i, 'str': ''};
    }
    let newString = comps[i].value;

    if (comps[i + 1].value !== ':') {
        return {'error': 'Error: ":" expected\n' +
        `at: ... ${comps.slice(i + 1).map(cp => cp.value).join(' ')}`};
    }
    newString += ':';

    const firstComp = analyzeComp(comps, i + 2, vars, false, 'array');
    if (firstComp.error) { return firstComp; }
    if (firstComp.str[0] !== ' ') { newString += ' '; }
    newString += firstComp.str;

    i = firstComp.i + 1;

    while (i < comps.length && comps[i].value === ';') {
        newString += comps[i].value;
        if (comps[i + 1].type !== strType.STR) {
            return {'error': 'Error: string expected\n' +
            `at: ... ${comps.slice(i + 1).map(cp => cp.value).join(' ')}`};
        }
        newString += comps[i + 1].value;

        if (comps[i + 2].value !== ':') {
            return {'error': 'Error: ":" expected\n' +
            `at: ... ${comps.slice(i + 2).map(cp => cp.value).join(' ')}`};
        }
        newString += ':';

        const result = analyzeComp(comps, i + 2, vars, false, 'array');
        if (firstComp.error) { return firstComp; }
        if (result.str[0] !== ' ') { newString += ' '; }
        newString += result.str;

        i = firstComp.i + 1;
    }

    return {'i': i - 1, 'str': newString};
}

function analyzeExpression(comps: {'type': strType, 'value': string}[], i: number, vars: string[], noSpace?: boolean):
                {'error'?: string, 'i'?: number, 'value'?: number, 'str'?: string} {
    // console.log('analyzeExpression |||', comps.slice(i).map(x => x.value).join(' '));
    let newString = '';
    while (i < comps.length && (comps[i].value === '-' || binaryOperators.has(comps[i].value))) {
        if (newString[newString.length - 1] !== ' ') { newString += ' '; }
        newString += comps[i].value;
        const result = analyzeComp(comps, i + 1, vars, false, 'expr');
        if (result.error) { return result; }
        i = result.i + 1;
        if (result.str[0] !== ' ') { newString += ' '; }
        newString += result.str;
    }
    return {'i': i - 1, 'str': newString};
}

// ARGUMENT INPUT
export function parseArgument_OLD(str: string): {'error'?: string, 'vars'?: string[], 'str'?: string} {
    const comps = splitComponents(str);
    if (typeof comps === 'string') {
        return {'error': comps};
    }
    let i = 0;
    const openBrackets = [0, 0, 0]; // [roundBracketCount, squareBracketCount, curlyBracketCount]
    const vars: string[] = [];
    let newString = '';
    while (i < comps.length) {
        const check = analyzeComponent(comps, i, openBrackets, vars);
        if (check.error) {
            return check;
        }
        i = check.value;
        newString += check.str;
    }
    if (openBrackets[0] > 0) {
        return { 'error': `Error: Mismatching number of round brackets: ${openBrackets[0]} extra open brackets "("`};

    } else if (openBrackets[0] < 0) {
        return { 'error': `Error: Mismatching number of round brackets: ${0 - openBrackets[0]} extra closing brackets ")"`};

    }
    if (openBrackets[1] > 0) {
        return { 'error': `Error: Mismatching number of square brackets: ${openBrackets[1]} extra open brackets "["`};

    } else if (openBrackets[1] < 0) {
        return { 'error': `Error: Mismatching number of square brackets: ${0 - openBrackets[1]} extra closing brackets "]"`};

    }
    if (openBrackets[2] > 0) {
        return { 'error': `Error: Mismatching number of curly brackets: ${openBrackets[2]} extra open brackets "{"`};

    } else if (openBrackets[2] < 0) {
        return { 'error': `Error: Mismatching number of curly brackets: ${0 - openBrackets[2]} extra closing brackets "}"`};

    }
    return {'vars': vars, 'str': newString};
}


//
// ANALYZE 1: GENERAL
//
function analyzeComponent(comps: {'type': strType, 'value': string}[], i: number,
                          openBrackets: number[], vars: string[]): {'error'?: string, 'value'?: number, 'str'?: string} {
    const comp = comps[i];
    let newString: string;
    if (comp.type === strType.VAR) {
        return checkVariable(comps, i, openBrackets, vars);
    } else if (comp.type !== strType.OTHER) {
        return checkNumStr(comps, i, openBrackets);
    } else {
        if (comp.value === '(') {
            openBrackets[0] += 1;
            if (!comps[i + 1] || (!isParameter(comps[i + 1]) && comps[i + 1].value !== ')')) {
                return { 'error': `Error: Expect expression, string, number or variable after "(" \n` +
                            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
            }
            newString = '( ';

        } else if (comp.value === '[') {
            openBrackets[1] += 1;
            if (!comps[i + 1] || (!isParameter(comps[i + 1]) && comps[i + 1].value !== ']')) {
                return { 'error': `Error: Expect expression, string, number or variable after "[" \n` +
                            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
            }
            newString = '[';

        } else if (comp.value === '{') {
            openBrackets[2] += 1;
            if (!comps[i + 1] || (!isParameter(comps[i + 1]) && comps[i + 1].value !== '}')) {
                return { 'error': `Error: Expect expression, string, number or variable after "{" \n` +
                            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
            }
            newString = '{ ';

        } else if (comp.value === ')') {
            openBrackets[0] -= 1;
            newString = comp.value;
            if (i + 1 < comps.length && !noSpaceBefore.has(comps[i + 1].value)) {
                newString += ' ';
            }

        } else if (comp.value === ']') {
            openBrackets[1] -= 1;
            newString = comp.value;
            if (i + 1 < comps.length && !noSpaceBefore.has(comps[i + 1].value)) {
                newString += ' ';
            }

        } else if (comp.value === '}') {
            openBrackets[2] -= 1;
            newString = comp.value;
            if (i + 1 < comps.length && !noSpaceBefore.has(comps[i + 1].value)) {
                newString += ' ';
            }

        } else if (comp.value === '@') {
            if (comps[i + 1].type !== strType.OTHER) {
                newString = comp.value + comps[i + 1].value;
                if (i + 2 < comps.length && comps[i + 2].value !== '[') {
                    newString += ' ';
                }
                i++;
            } else {
                return { 'error': 'Error: Expect attribute name after @ \n' +
                `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
            }
        } else if (postfixUnaryOperators.has(comp.value)) {
            if (!isParameter(comps[i - 1], true)) {
                return { 'error': `Error: Expect expression, string, number or variable before operator ${comp.value} \n` +
                `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
            }
            newString = comp.value + ' ';

        } else if (prefixUnaryOperators.has(comp.value)) {
            if (i === comps.length - 1 || !isParameter(comps[i + 1])) {
                return { 'error': `Error: Expect expression, string, number or variable after operator ${comp.value} \n` +
                `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
            }
            if (comp.value === '-') {
                newString = comp.value + ' ';
            } else {
                newString = comp.value;
            }

        } else if (binaryOperators.has(comp.value)) {
            let checkBef: boolean, checkAft: boolean;
            if (mathOperators.has(comp.value)) {
                checkBef = !isParameter(comps[i - 1], true, true);
                checkAft = i === comps.length - 1 || !isParameter(comps[i + 1], false, true);
            } else {
                checkBef = !isParameter(comps[i - 1], true);
                checkAft = i === comps.length - 1 || !isParameter(comps[i + 1], false);
            }
            if (checkBef) {
                return { 'error': `Error: Expect expression, string, number or variable before operator ${comp.value} \n` +
                `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
            }
            if (checkAft) {
                return { 'error': `Error: Expect expression, string, number or variable after operator ${comp.value} \n` +
                `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
            }
            newString = comp.value + ' ';
        } else if (otherSymbols.has(comp.value)) {
            if (comp.value === '.' || comp.value === '#') {
                newString = comp.value;
            } else {
                newString = comp.value + ' ';
            }
        } else {
            newString = comp.value + ' ';
        }
        i++;
    }
    return {'value': i, 'str': newString};
}

//
// ANALYZE 2: VARIABLE
//
function checkVariable(comps: {'type': strType, 'value': string}[], i: number,
                       openBrackets: number[], vars: string[]): {'error'?: string, 'value'?: number, 'str'?: string} {
    const comp = comps[i];
    // if variable is the last component
    // add the variable to the var list
    if (i + 1 === comps.length) {
        addVars(vars, comp.value);
        i += 1;
        return {'value': i, 'str': comp.value};
    }
    // if variable is followed immediately by another var/num/str --> not allowed
    if ( comps[i + 1].type !== strType.OTHER ) {
        return { 'error': 'Error: Variable followed by another variable/number/string \n' +
        `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};

    // if variable is followed by "[" --> array/json
    // add the variable to var list and check for validity of the first component inside the bracket
    } else if (comps[i + 1].value === '[') {
        addVars(vars, comp.value);
        openBrackets[1] += 1;
        i += 2;
        if (!isParameter(comps[i])) {
            return { 'error': 'Error: Expect expression, string, number or variable after "[" \n' +
            `at: ... ${comps.slice(i - 2).map(cp => cp.value).join(' ')}`};
        }
        return {'value': i, 'str': comp.value + '['};

    // if variable is followed by "(" --> function
    // does not add to the var list since it's function name
    } else if (comps[i + 1].value === '(') {
        openBrackets[0] += 1;
        i += 2;
        if (comps[i].value === ')') {
            i++;
            openBrackets[0] -= 1;
        } else if (!isParameter(comps[i])) {
            return { 'error': 'Error: Expect expression, string, number, variable or ")" after "(" \n' +
            `at: ... ${comps.slice(i - 2).map(cp => cp.value).join(' ')}`};
        }
        return {'value': i, 'str': comp.value + '( '};

    // if variable is followed by "{" --> not allowed
    } else if (comps[i + 1].value === '{') {
        return { 'error': 'Error: Variable followed by "{" \n' +
        `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};

    // if variable is followed by "#" / "." / "@" / ")" / "]" / "}"
    } else if (otherSymbols.has(comps[i + 1].value) ||
               comps[i + 1].value === ')' ||
               comps[i + 1].value === ']' ||
               comps[i + 1].value === '}') {
        if (comps[i + 1].value === '#') {
            return { 'error': `Error: Variable followed by "${comps[i + 1].value}" \n` +
            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
        }
        addVars(vars, comp.value);
        i += 1;
        return {'value': i, 'str': comp.value};
    // all other cases
    } else {
        addVars(vars, comp.value);
        i += 1;
        return {'value': i, 'str': comp.value + ' '};
    }
}

//
// ANALYZE 3: NUMBER/STRING
//
function checkNumStr(comps: {'type': strType, 'value': string}[], i: number,
                     openBrackets: number[]): {'error'?: string, 'value'?: number, 'str'?: string} {
    const comp = comps[i];

    // if num/str is the last component --> return
    if (i + 1 === comps.length) {
        i += 1;
        return {'value': i, 'str': comp.value};
    }
    // if num/str is followed by another var/num/str --> not allowed
    if ( comps[i + 1].type !== strType.OTHER ) {
        return { 'error': 'Error: number/string followed by another variable/number/string \n' +
        `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};

    // if num/str is followed by "(" or "{" --> not allowed
    } else if (comps[i + 1].value === '(' || comps[i + 1].value === '{') {
        return { 'error': 'Error: number/string followed by bracket \n' +
        `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};

    // if num/str is followed by "[" --> only allowed for str
    } else if (comps[i + 1].value === '[') {
        if (comp.type === strType.NUM) {
            return { 'error': 'Error: number/string followed by bracket \n' +
            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
        }
        openBrackets[1] += 1;
        i += 2;
        if (!isParameter(comps[i])) {
            return { 'error': 'Error: Expect expression, string, number or variable after [ \n' +
            `at: ... ${comps.slice(i - 2).map(cp => cp.value).join(' ')}`};
        }
    // if variable is followed by "#" / "." / "@" / ")" / "]" / "}"
    } else if ( otherSymbols.has(comps[i + 1].value) ||
                comps[i + 1].value === ')' ||
                comps[i + 1].value === ']' ||
                comps[i + 1].value === '}') {
        if (comps[i + 1].value === '@' || comps[i + 1].value === '#') {
            return { 'error': `Error: number/string followed by "${comps[i + 1].value}" \n` +
            `at: ... ${comps.slice(i).map(cp => cp.value).join(' ')}`};
        }
        i += 1;
        return {'value': i, 'str': comp.value};
    // all other cases
    } else {
        i += 1;
        return {'value': i, 'str': comp.value + ' '};
    }
}

function isParameter(comp: {'type': strType, 'value': string}, prev: boolean = false, noSpecialBracket: boolean = false): boolean {
    if (prev) {
        if (comp.value === '}') {
            if (noSpecialBracket) {
                return false;
            } else { return true; }
        }
        return  comp.type !== strType.OTHER ||
                comp.value === ']' ||
                comp.value === ')';
    }
    if (comp.value === '[' || comp.value === '{') {
        if (noSpecialBracket) {
            return false;
        } else { return true; }
    }
    return  comp.type !== strType.OTHER ||
            comp.value === '(' ||
            comp.value === '-' ||
            comp.value === '#' ||
            comp.value === '@';
}

function addVars(varList: string[], varName: string) {
    if (allConstants.indexOf(varName) !== -1) { return; }
    if (reservedWords.indexOf(varName) !== -1) { return; }
    if (varList.indexOf(varName) === -1) {
        varList.push(varName);
    }
}


/**
 * __________________________________________________________________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 * ____________________ SPLITTING COMPONENTS FROM STRING ____________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 *
*/
function splitComponents(str: string): {'type': strType, 'value': string}[] | string {
    const comps = [];
    let i = 0;
    while (i < str.length) {
        let code = str.charCodeAt(i);

        // numeric (0-9) ==> number
        if (code > 47 && code < 58) {
            const startI = i;
            while ((code > 47 && code < 58) || code === 46) {
                i ++;
                if (i === str.length) { break; }
                code = str.charCodeAt(i);
            }
            comps.push({'type': strType.NUM, 'value': str.substring(startI, i)});

        // upper alpha (A-Z) & lower alpha (a-z) ==> variable
        } else if ((code > 64 && code < 91) || (code > 96 && code < 123)) {
            const startI = i;
            // upper alpha (A-Z), lower alpha (a-z), numeric (0-9) and "_" are allowed for subsequent characters.
            while ((code > 64 && code < 91) || (code > 96 && code < 123) || (code > 47 && code < 58) || code === 95) {
                i += 1;
                if (i === str.length) { break; }
                code = str.charCodeAt(i);
            }
            comps.push({ 'type': strType.VAR, 'value': str.substring(startI, i)});

        // double-quotes (") or single-quotes (')
        } else if (code === 34 || code === 39) {
            const startCode = code;
            const startI = i;
            i += 1;
            code = str.charCodeAt(i);
            if (!code) {
                return 'Error: Missing ending quote.';
            }
            while (code !== startCode) { // string must end with the same quote as well
                i += 1;
                if (i === str.length) { break; }
                code = str.charCodeAt(i);
            }
            if (code === startCode) { i += 1; }
            const subStr = str.substring(startI, i);
            if (subStr.charCodeAt(subStr.length - 1) !== startCode) {
                return 'Error: Missing ending quote.';
            }
            comps.push({ 'type': strType.STR, 'value': str.substring(startI, i)});

        // + sign or - sign ==> + / ++ / += / - / -- / -=
        } else if ( code === 43 || code === 45) {
            if (str.charCodeAt(i + 1) === code || str.charCodeAt(i + 1) === 61) {
                comps.push({ 'type': strType.OTHER, 'value': str.substring(i, i + 2)});
                i += 2;
            } else {
                comps.push({ 'type': strType.OTHER, 'value': str.charAt(i)});
                i++;
            }

        // comparison operator (!, <, =, >)
        } else if (code === 33 || (code > 59 && code < 63)) {
            const startI = i;
            i++;
            if (str.charCodeAt(i) === 61) { // !=, <=, >=, ==
                i++;
                if (str.charCodeAt(i) === 61) { // !==, ===
                    if (code === 60 || code === 62) { // mark invalid for <== and >==
                        return 'Error: <== and >== not acceptable.';
                    }
                    i++;
                }
            }
            comps.push({ 'type': strType.OTHER, 'value': str.substring(startI, i)});

        // or operator (||); check 1st |
        } else if (code === 124) {
            i++;
            if (str.charCodeAt(i) !== 124) { // check 2nd |
                return 'Error: || expected.';
            }
            comps.push({ 'type': strType.OTHER, 'value': '||'});
            i++;
        } else if (code === 38) { // and operator (&&); check 1st &
            i++;
            if (str.charCodeAt(i) !== 38) { // check 2nd &
                return 'Error: && expected.';
            }
            comps.push({ 'type': strType.OTHER, 'value': '&&'});
            i++;

        // others: numeric operator (*, /, %), brackets ((), [], {}), comma (,), space, ...
        } else {
            if (code !== 32) { // add to comp if it's not space
                comps.push({ 'type': strType.OTHER, 'value': str.charAt(i)});
            }
            i++;
        }
    }
    return comps;
}




/**
 * __________________________________________________________________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 * _________________ CHECK IF THE VARIABLES USED ARE VALID __________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 *
*/
export function checkValidVar(vars: string[], procedure: IProcedure, nodeProdList: IProcedure[]): {'error'?: string, 'vars'?: string[]} {
    let current = procedure;
    const validVars = [];
    for (const glb of globals) {
        const i = vars.indexOf(glb);
        if (i !== -1) {
            validVars.push(vars.splice(i, 1)[0]);
        }
    }
    while (current.parent) {
        const prods = current.parent.children;
        for (const prod of prods) {
            if (prod.ID === current.ID) {
                if (current.type !== ProcedureTypes.Foreach) {
                    break;
                } else {
                    const i = vars.indexOf(prod.variable);
                    if (i !== -1) {
                        validVars.push(vars.splice(i, 1)[0]);
                    }
                    break;
                }
            }
            if (!prod.variable || prod.type === ProcedureTypes.Foreach) { continue; }
            const index = vars.indexOf(prod.variable);
            if (index !== -1) {
                validVars.push(vars.splice(index, 1)[0]);
            }
        }
        current = current.parent;
    }
    if (vars.length === 0) {
        return {'vars': validVars};
    }
    for (const prod of nodeProdList) {
        if (prod.ID === current.ID) {
            if (current.type !== ProcedureTypes.Foreach) {
                break;
            } else {
                const i = vars.indexOf(prod.variable);
                if (i !== -1) {
                    validVars.push(vars.splice(i, 1)[0]);
                }
                break;
            }
        }
        if (!prod.variable || prod.type === ProcedureTypes.Foreach) { continue; }
        const index = vars.indexOf(prod.variable);
        if (index !== -1) {
            validVars.push(vars.splice(index, 1)[0]);
        }
    }
    if (vars.length > 0) {
        return { 'error': `Error: Invalid vars: ${vars.join(', ')}`};
    }
    return {'vars': validVars};
}

/**
 * __________________________________________________________________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 * ______________________ CHECK THE VALIDITY OF A NODE ______________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 *
*/
export function checkNodeValidity(node: INode) {
    if (node.type === 'start') {
        updateGlobals(node);
    }
    checkProdListValidity(node.procedure, node.procedure);
}

function checkProdListValidity(prodList: IProcedure[], nodeProdList: IProcedure[]) {
    for (const prod of prodList) {
        switch (prod.type) {
            case ProcedureTypes.Variable:
            case ProcedureTypes.Foreach:
                modifyVar(prod, nodeProdList);
                modifyArgument(prod, 1, nodeProdList);
                break;
            case ProcedureTypes.Function:
            case ProcedureTypes.Imported:
                if (prod.args[0].name !== '__none__') {
                    modifyVar(prod, nodeProdList);
                }
                for (let i = 1; i < prod.argCount; i++) {
                    if (prod.args[i].name[0] === '_') { continue; }
                    modifyArgument(prod, i, nodeProdList);
                }
                break;
            case ProcedureTypes.If:
            case ProcedureTypes.Elseif:
            case ProcedureTypes.While:
                modifyArgument(prod, 0, nodeProdList);
                break;
        }
        if (prod.children) {
            checkProdListValidity(prod.children, nodeProdList);
        }
        if (prod.argCount === 0) {
            continue;
        }
        for (const arg of prod.args) {
            arg.linked = false;
        }
    }
}

export function updateInputValidity(type: 'add'|'remove', procedure: IProcedure, nodeProdList: IProcedure[]) {
    let current = procedure;
    while (current.parent) {
        const prods = current.parent.children;
        for (const prod of prods) {
            if (prod.ID === current.ID) {
                if (current.type !== ProcedureTypes.Foreach) {
                    break;
                } else {
                    if (prod.variable !== procedure.variable) { break; }
                    return;
                }
            }
            if (!prod.variable || prod.type === ProcedureTypes.Foreach || prod.variable !== procedure.variable) { continue; }
            return;
        }
        current = current.parent;
    }
    for (const prod of nodeProdList) {
        if (prod.ID === current.ID) {
            if (current.type !== ProcedureTypes.Foreach) {
                break;
            } else {
                if (prod.variable !== procedure.variable) { break; }
                return;
            }
        }
        if (!prod.variable || prod.type === ProcedureTypes.Foreach || prod.variable !== procedure.variable) { continue; }
        return;
    }

    if (type === 'add') {
        if (procedure.parent) {
            updateAdd(procedure.parent.children, procedure.variable, procedure);
        } else {
            updateAdd(nodeProdList, procedure.variable, procedure);
        }
    } else {
        if (procedure.parent) {
            updateRemove(procedure.parent.children, procedure.variable, procedure);
        } else {
            updateRemove(nodeProdList, procedure.variable, procedure);
        }
    }
}

function updateAdd(prodList: IProcedure[], varName: string, procedure?: IProcedure) {
    for (let i = prodList.length - 1; i > 0; i--) {
        if (procedure && procedure.ID === prodList[i].ID) { break; }
        if (prodList[i].children) { updateAdd(prodList[i].children, varName); }
        if (prodList[i].argCount === 0) { continue; }
        for (const arg of prodList[i].args) {
            if (!arg.invalidVar) { continue; }
            if (arg.invalidVar === `Error: Invalid vars: ${varName}`) {
                arg.invalidVar = false;
            } else if (typeof arg.invalidVar === 'string' && arg.invalidVar.indexOf('Invalid vars') !== -1) {
                arg.invalidVar.replace(`${varName}\s,`, '');
                arg.invalidVar.replace(`, ${varName}`, '');
            }
        }
    }
}

function updateRemove(prodList: IProcedure[], varName: string, procedure?: IProcedure) {
    for (let i = prodList.length - 1; i > 0; i--) {
        if (procedure && procedure.ID === prodList[i].ID) { break; }
        if (prodList[i].children) { updateRemove(prodList[i].children, varName); }
        if (prodList[i].argCount === 0) { continue; }
        for (const arg of prodList[i].args) {
            if (arg.usedVars.indexOf(varName) === -1) { continue; }
            if (!arg.invalidVar) {
                arg.invalidVar = `Error: Invalid vars: ${varName}`;
            } else if (typeof arg.invalidVar === 'string' && arg.invalidVar.indexOf('Invalid vars') !== -1) {
                arg.invalidVar = arg.invalidVar.concat(`, ${varName}`);
            }
        }
    }

}

