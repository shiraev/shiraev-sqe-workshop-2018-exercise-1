import $ from 'jquery';
import {parseCode} from './code-analyzer';

let parsedCodeModel = [];
let sessionNumber;
const columnNames = ['Line', 'Type', 'Name', 'Cond', 'Value'];

const funcHandler = function (funT) {
    return [funT.loc, funT.type, funT.name, '', ''];
};
const varHandler = function (varT) {
    return [varT.loc, varT.type, varT.name, '', varT.value];
};
const assignmentHandler = function (assT) {
    return [assT.loc, assT.type, assT.name, '', assT.value];
};
const forHandler = function (forT) {
    return [forT.loc, forT.type, '', forT.value, ''];
};
const whileHandler = function (whileT) {
    return [whileT.loc, whileT.type, '', whileT.value, ''];
};
const ifHandler = function (ifT) {//not finished
    return [ifT.loc, ifT.type, '', ifT.value, ''];
};
const elseHandler = function(elseT) {
    return [elseT.loc, elseT.type, '', '', ''];
};
const returnHandler = function (retT)  {
    return [retT.loc, retT.type, '', '', retT.value];
};

let handlers = {
    FunctionDeclaration : funcHandler,
    VariableDeclaration : varHandler ,
    AssignmentExpression : assignmentHandler,
    ForStatement : forHandler,
    WhileStatement : whileHandler,
    IfStatement : ifHandler,
    ElseStatement : elseHandler,
    ReturnStatement : returnHandler};

let totalRows;
const cellsInRow = 5;

function drawTable() {/**menu line**/
    let divMain = document.getElementById('divMain'), tbl = document.createElement('table'), rowMenu = document.createElement('tr');
    for (let i = 0; i < cellsInRow; i++) {
        let cellM = document.createElement('td'), cellText1 = document.createTextNode(columnNames[i]);
        cellM.appendChild(cellText1);
        rowMenu.appendChild(cellM);
    }
    tbl.appendChild(rowMenu);
    for (let r = 0; r < totalRows; r++) {//rest lines
        let row = document.createElement('tr'), currObject = parsedCodeModel[sessionNumber][r], line = handlers[currObject.type](currObject);
        for (let c = 0; c < cellsInRow; c++) {
            let cell = document.createElement('td'), cellText = document.createTextNode(line[c]);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        tbl.appendChild(row);
    }
    divMain.appendChild(tbl); // appends <table> into <divMain>
}

$(document).ready(function () {
    sessionNumber = 0;
    $('#codeSubmissionButton').click(() => {
        $('#divMain tr>td').remove();//clean table between every session
        let codeToParse = $('#codePlaceholder').val();
        parsedCodeModel[sessionNumber] = parseCode(codeToParse);
        totalRows = parsedCodeModel[sessionNumber].length;
        $('#parsedCode').val(drawTable());
        sessionNumber = sessionNumber + 1;
    });
});

