import * as esprima from 'esprima';

let originString;
const supported = ['FunctionDeclaration',
    'VariableDeclaration' ,
    'ExpressionStatement',
    'AssignmentExpression',
    'ForStatement',
    'WhileStatement',
    'IfStatement',
    'ReturnStatement'];

let isSupported = function (x) {
    for (let i = 0; i < supported.length; i++){
        if (x === supported[i])
            return true;
    }
    return false;
};

//creating var
let varOrganizer = function (loc, type, name, value){//helper
    return {loc, type, name, value};
};

const funcHandler = function (funC) {
    let type = 'FunctionDeclaration';
    let name = funC.id['name'];
    let paramsNames = (funC.params).map( x => x['name']);
    let loc = (funC.id.loc.start.line);

    let vars =[];
    let varsType = 'VariableDeclaration';
    for (let i = 0; i < paramsNames.length; i++)
        vars[i] = varOrganizer(loc, varsType, paramsNames[i],'');

    return [{loc, type, name }].concat(vars);
};
//var helper
let varHandlerValueHelper = function (x) {//helper
    if(x.init !== null){
        let range = x.init['range'];
        return originString.substring(range[0],range[1]);
    }
    return [];
};
const varHandler = function (varC) {
    let type = 'VariableDeclaration';
    let name = (varC.declarations).map( x => x.id['name']);

    let value = (varC.declarations).map( x => varHandlerValueHelper(x));
    let loc = (varC.loc.start['line']);
    let vars =[];
    for (let i=0; i < name.length; i++)
        vars[i] = varOrganizer(loc, type, name[i], value[i]);
    return vars;
};
/** making sure ass will happen**/
const expHandler = function (expC) {//helper
    if ('expression' in expC && isSupported(expC.expression.type))
        return handlers[expC.expression.type](expC.expression);
    return [];
};
const assignmentHandler = function (assC) {
    let type = 'AssignmentExpression';
    let nameRange = assC.left['range'];
    let name = originString.substring(nameRange[0], nameRange[1]);

    let range = assC.right['range'];
    let value = originString.substring(range[0],range[1]);

    let loc = (assC.loc.start['line']);
    return {loc, type, name, value};
};
const forHandler = function (forC) {
    let type = 'ForStatement';

    let rangeInit = forC.init['range'];
    let valueInit = originString.substring(rangeInit[0],rangeInit[1]);

    let rangeCond = forC.test['range'];
    let valueCond = originString.substring(rangeCond[0],rangeCond[1]);

    let rangeUp = forC.update['range'];
    let valueUp = originString.substring(rangeUp[0],rangeUp[1]);

    let value = ''.concat(valueInit, ' ;', valueCond, ' ;', valueUp);
    let loc = (forC.loc.start['line']);
    return {loc, type, value};
};
const whileHandler = function (whileC) {
    let type = 'WhileStatement';

    let range = whileC.test['range'];
    let value = originString.substring(range[0],range[1]);

    let loc = (whileC.loc.start['line']);
    return {loc, type, value};
};
/*** if else ***/
//organizer of if else
let alterHandler = function (altC) {//helper
    if('value' in altC && altC['type'] === 'ElseStatement')
        return [altC].concat(alterHandler(altC.value));
    else return [altC];
};
const ifHandler = function (ifC) {
    let type = 'IfStatement';

    let alternate = [];
    if(ifC.alternate !== undefined && ifC.alternate !== null)
        alternate = elseHandler(ifC['alternate']);
    let body = [];
    if('consequent' in ifC)
        body = parsedRec(ifC.consequent);
    let alters = alterHandler(alternate);

    let range = ifC.test['range'];
    let value = originString.substring(range[0],range[1]);

    let loc = (ifC.loc.start['line']);
    return [{loc, type, value}].concat(body).concat(alters);
};

const elseHandler = function(elseC) {
    let type = 'ElseStatement';
    let value  = handlers[elseC.type](elseC);
    let loc = elseC.loc.start['line'];
    return {loc, type, value};
};
/******/
const returnHandler = function (retC)  {
    let type = 'ReturnStatement';
    let range = retC.argument['range'];
    let value = originString.substring(range[0],range[1]);
    let loc = (retC.loc.start['line']);
    return {loc, type, value};
};

//types handlers
let handlers = {
    FunctionDeclaration : funcHandler,
    VariableDeclaration : varHandler ,
    ExpressionStatement : expHandler,
    AssignmentExpression : assignmentHandler,
    ForStatement : forHandler,
    WhileStatement : whileHandler,
    IfStatement : ifHandler,
    ReturnStatement : returnHandler};

/***** data functions only ******/
//rec helpers
let rbHelper = function (innerBody) {
    if('body' in innerBody)
        return parsedRec(innerBody.body);
    else return [];
};
let bHelper = function(curr) {
    if(curr.type in handlers) {
        return handlers[curr.type](curr);
    }
    else return [];
};

//recursive parser
let parsedRec = function (x) {
    let recBodies = [];
    let bodySep = [];
    if(x instanceof Array && x !== undefined) {
        recBodies = x.map(y => rbHelper(y));
        bodySep = x.map(curr => bHelper(curr));
    }
    else  {
        recBodies = rbHelper(x);
        if(x.type in handlers)
            bodySep = handlers[x.type](x);
    }
    if(!(bodySep instanceof  Array))
        bodySep = [bodySep];
    return bodySep.concat(recBodies);
};
/** flat implementation **/
function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

//parse code starter
const parseCode = (codeToParse) => {
    originString = codeToParse;
    let body =  ((esprima.parseScript(codeToParse, {loc:true, range: true})).body);
    //arrange and return data
    return flatten(parsedRec(body)).sort(function (a,b) {
        return a.loc - b.loc;
    });
};

export {parseCode};
