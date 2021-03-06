import test from 'ava';
import AbstractSyntaxTree from '../../index';

test('it works', t => {
    t.truthy(new AbstractSyntaxTree('var x = 0;'));
});

test('it queries the syntax tree', t => {
    var ast = new AbstractSyntaxTree('var y = 1;');
    var declarations = ast.find('VariableDeclaration');
    t.truthy(declarations.length === 1);
});

test('it checks if node is in the syntax tree', t => {
    var ast = new AbstractSyntaxTree('var z = 2;');
    t.truthy(ast.has('VariableDeclaration'));
});

test('it returns the source', t => {
    var ast = new AbstractSyntaxTree('var a = 3;');
    t.truthy(ast.toSource() === 'var a = 3;');
});

test('it removes nodes', t => {
    var ast = new AbstractSyntaxTree('"use strict"; var b = 4;');
    ast.remove({ type: 'Literal', value: 'use strict' });
    t.truthy(ast.toSource() === 'var b = 4;');
});

test('it removes function declarations', t => {
    var source = 'var a = 1; function hello () { return "world"; }';
    var ast = new AbstractSyntaxTree(source);
    ast.remove({
        type: 'FunctionDeclaration',
        id: {
            type: 'Identifier',
            name: 'hello'
        }
    });
    t.truthy(ast.toSource() === 'var a = 1;');
});

test('it keeps variable declarations', t => {
    var source = 'var a = 1, b = 2; function hello () { return "world"; }';
    var ast = new AbstractSyntaxTree(source);
    ast.remove({
        type: 'VariableDeclarator',
        id: {
            type: 'Identifier',
            name: 'a'
        }
    });
    t.truthy(ast.toSource() === `var b = 2;\nfunction hello() {\n    return 'world';\n}`);
});

test('it removes empty declarations', t => {
    var source = 'var a = 1; function hello () { return "world"; }';
    var ast = new AbstractSyntaxTree(source);
    ast.remove({
        type: 'VariableDeclarator',
        id: {
            type: 'Identifier',
            name: 'a'
        }
    });
    t.truthy(ast.toSource() === `function hello() {\n    return 'world';\n}`);
});

test('it returns the first node', t => {
    var ast = new AbstractSyntaxTree('var a = 1; var b = 2;');
    var declaration = ast.first('VariableDeclaration');
    t.truthy(declaration.declarations[0].id.name === 'a');
});

test('it returns the last node', t => {
    var ast = new AbstractSyntaxTree('var c = 3; var d = 4;');
    var declaration = ast.last('VariableDeclaration');
    t.truthy(declaration.declarations[0].id.name === 'd');
});

test('it works with imports', t => {
    var source = `import _ from 'underscore';`;
    var ast = new AbstractSyntaxTree(source);
    t.truthy(ast.toSource() === source);
});

test('it should be possible to remove the first element only', t => {
    var source = 'var a = 1; var b = 2;';
    var ast = new AbstractSyntaxTree(source);
    ast.remove({ type: 'VariableDeclaration' }, { first: true });
    t.truthy(ast.toSource() === 'var b = 2;');
});

test('it should be possible to beautify the source', t => {
    var source = 'var a = 1; var b = 2;';
    var ast = new AbstractSyntaxTree(source);
    t.truthy(ast.toSource({ beautify: true }) === 'var a = 1;\nvar b = 2;\n');
});

test('it exposes a static parse method', t => {
    var source = 'var a = 1;';
    var ast = AbstractSyntaxTree.parse(source);
    t.truthy(ast.type === 'Program');
});

test('it supports comments', t => {
    var source = '/* hello */\nvar a = 1;';
    var ast = new AbstractSyntaxTree(source);
    t.truthy(ast.toSource({ comments: true }) === source);
});

test('it supports different quote types', t => {
    var source = `var a = 'hello';`;
    var ast = new AbstractSyntaxTree(source);
    t.truthy(ast.toSource({ quotes: "double" }) === `var a = "hello";`);
});

test('it prepends a node to body', t => {
    var source = 'var a = 1;';
    var ast = new AbstractSyntaxTree(source);
    ast.prepend({
        type: 'ExpressionStatement',
        expression: {
            type: 'Literal',
            value: 'use strict'
        }
    });
    t.truthy(ast.toSource() === '\'use strict\';\nvar a = 1;');
});

test('it appends a node to body', t => {
    var source = 'var a = 1;';
    var ast = new AbstractSyntaxTree(source);
    ast.append({
        type: 'ExpressionStatement',
        expression: {
            type: 'Literal',
            value: 'use strict'
        }
    });
    t.truthy(ast.toSource() === 'var a = 1;\n\'use strict\';');
});

test('it replaces nodes', t => {
    var source = 'var a = 1';
    var ast = new AbstractSyntaxTree(source);
    ast.replace({
        enter: function (node) {
            if (node.type === 'VariableDeclaration') {
                node.kind = 'let';
            }
            return node;
        }
    });
    t.truthy(ast.toSource() === 'let a = 1;');
});
