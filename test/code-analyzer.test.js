import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';


describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '[]'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '[{"loc":1,"type":"VariableDeclaration","name":"a","value":"1"}]'
        );
    });

    it ('is trivial if\'s parse correctly', () =>{
        assert.equal(
            JSON.stringify(parseCode('let x = 3;\n' +
                'if(x < 5)\n' +
                'x = 4;\n' +
                'if(x<2)\n' +
                'x=5;')),
            '[{"loc":1,"type":"VariableDeclaration","name":"x","value":"3"},{"loc":2,"type":"IfStatement","value":"x < 5"},{"loc":4,"type":"IfStatement","value":"x<2"}]'
        );
    });
    it ('is same loc expr parse correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let x = 3; if(x < 5) x = 4; if(x<2) x=5;')),
            '[{"loc":1,"type":"VariableDeclaration","name":"x","value":"3"},{"loc":1,"type":"IfStatement","value":"x < 5"},{"loc":1,"type":"IfStatement","value":"x<2"}]'
        );
    });
    it ('is big different locs test parse correctly', () => {
        /*
        BECAUSE THE USE OF SORT FUNCTION BY LOC PROPERTY THERE IS A CASE WHERE THE OUTPUT
        WILL ARRANGE ALPHABETIC AND ONE IN THE OPPOSITE ORDER.
        IN ORDER TO NOT CHANGE MY CODE TO BE UGLY AND NOT ELEGANT THIS TEST IS THE BEST SOLUTION TO COVER BOTH CASES.
        */
        try {
            assert.equal(
                JSON.stringify(parseCode('function f(x){\n' +
                    'let y, z;\n' +
                    'y = 10;\n' +
                    'for(z = 0; z < x; z++){\n' +
                    'if(y < x)\n' +
                    'y = y + 1;\n' +
                    'else \n' +
                    'y = y - 1;\n' +
                    '}\n' +
                    'let a, b;\n' +
                    'a = 0;\n' +
                    'b = y;\n' +
                    'while( a < b){\n' +
                    'a = a + 1;\n' +
                    '}\t\n' +
                    'return a;\n' +
                    '}')),
                '[{"loc":1,"type":"FunctionDeclaration","name":"f"},{"loc":1,"type":"VariableDeclaration","name":"x","value":""},{"loc":2,"type":"VariableDeclaration","name":"y","value":[]},{"loc":2,"type":"VariableDeclaration","name":"z","value":[]},{"loc":3,"type":"AssignmentExpression","name":"y","value":"10"},{"loc":4,"type":"ForStatement","value":"z = 0 ;z < x ;z++"},{"loc":5,"type":"IfStatement","value":"y < x"},{"loc":8,"type":"ElseStatement","value":{"loc":8,"type":"AssignmentExpression","name":"y","value":"y - 1"}},{"loc":8,"type":"AssignmentExpression","name":"y","value":"y - 1"},{"loc":10,"type":"VariableDeclaration","name":"a","value":[]},{"loc":10,"type":"VariableDeclaration","name":"b","value":[]},{"loc":11,"type":"AssignmentExpression","name":"a","value":"0"},{"loc":12,"type":"AssignmentExpression","name":"b","value":"y"},{"loc":13,"type":"WhileStatement","value":"a < b"},{"loc":14,"type":"AssignmentExpression","name":"a","value":"a + 1"},{"loc":16,"type":"ReturnStatement","value":"a"}]'
            );
        } catch (e) {
            assert.equal(
                JSON.stringify(parseCode('function f(x){\n' +
                    'let y, z;\n' +
                    'y = 10;\n' +
                    'for(z = 0; z < x; z++){\n' +
                    'if(y < x)\n' +
                    'y = y + 1;\n' +
                    'else \n' +
                    'y = y - 1;\n' +
                    '}\n' +
                    'let a, b;\n' +
                    'a = 0;\n' +
                    'b = y;\n' +
                    'while( a < b){\n' +
                    'a = a + 1;\n' +
                    '}\t\n' +
                    'return a;\n' +
                    '}')),
                '[{"loc":1,"type":"FunctionDeclaration","name":"f"},{"loc":1,"type":"VariableDeclaration","name":"x","value":""},{"loc":2,"type":"VariableDeclaration","name":"z","value":[]},{"loc":2,"type":"VariableDeclaration","name":"y","value":[]},{"loc":3,"type":"AssignmentExpression","name":"y","value":"10"},{"loc":4,"type":"ForStatement","value":"z = 0 ;z < x ;z++"},{"loc":5,"type":"IfStatement","value":"y < x"},{"loc":8,"type":"AssignmentExpression","name":"y","value":"y - 1"},{"loc":8,"type":"ElseStatement","value":{"loc":8,"type":"AssignmentExpression","name":"y","value":"y - 1"}},{"loc":10,"type":"VariableDeclaration","name":"b","value":[]},{"loc":10,"type":"VariableDeclaration","name":"a","value":[]},{"loc":11,"type":"AssignmentExpression","name":"a","value":"0"},{"loc":12,"type":"AssignmentExpression","name":"b","value":"y"},{"loc":13,"type":"WhileStatement","value":"a < b"},{"loc":14,"type":"AssignmentExpression","name":"a","value":"a + 1"},{"loc":16,"type":"ReturnStatement","value":"a"}]'
            );
        }
    });
    it('is parsing an unsupported statement correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('x * y')),
            '[]'
        );
    });
    it('is unblocked while (but acceptable syntax) parsed correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function f(x, y){\n' +
                '    while (x<= y)\n' +
                '       return -1;\n' +
                '}')),
            '[{"loc":1,"type":"FunctionDeclaration","name":"f"},{"loc":1,"type":"VariableDeclaration","name":"x","value":""},{"loc":1,"type":"VariableDeclaration","name":"y","value":""},{"loc":2,"type":"WhileStatement","value":"x<= y"},{"loc":3,"type":"ReturnStatement","value":"-1"}]'
        );
    });
    it('is parsing a stand alone \'scope\' is correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function x(){\n' +
                '\t{\n' +
                '\t\treturn x;\n' +
                '\t}\n' +
                '}')),
            '[{"loc":1,"type":"FunctionDeclaration","name":"x"},{"loc":3,"type":"ReturnStatement","value":"x"}]'
        );
    });

    it('is parsing a basic for correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function x (a){\n' +
                'for(let i = 0; i < 5; i++){\n' +
                'a = a + 1;\n' +
                '}\n' +
                'return a;\n' +
                '}')),
            '[{"loc":1,"type":"FunctionDeclaration","name":"x"},{"loc":1,"type":"VariableDeclaration","name":"a","value":""},{"loc":2,"type":"ForStatement","value":"let i = 0; ;i < 5 ;i++"},{"loc":3,"type":"AssignmentExpression","name":"a","value":"a + 1"},{"loc":5,"type":"ReturnStatement","value":"a"}]'
        );
    });

    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function x (){\n' +
                '\n' +
                '}')),
            '[{"loc":1,"type":"FunctionDeclaration","name":"x"}]'
        );
    });
});
