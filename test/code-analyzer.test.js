import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {

    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '[]'
        );
    });
/*
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '[\n' +
            '  {\n' +
            '    "loc": 1,\n' +
            '    "type": "VariableDeclaration",\n' +
            '    "name": "a",\n' +
            '    "value": []\n' +
            '  }\n' +
            ']'
        );
    });*/
});
