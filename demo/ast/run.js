const { parse } = require('@babel/parser'); // 将源代码解析为ast
const generate = require('@babel/generator').default; // 将ast转换生成代码
const traverse = require('@babel/traverse').default; // 遍历ast，对各个节点进行处理
const t = require('@babel/types');
const path = require('path');
const fs = require('fs');

const codePath = './code/demo.ts';
const file = fs.readFileSync(path.resolve(__dirname, codePath)).toString();
const ast = parse(file, {
  sourceType: 'module',
  plugins: ['decorators-legacy'], // 如果代码中有装饰器，需要添加该plugin，才能识别。
});
let code;
let hasProviders = false;
traverse(ast, {
  ClassDeclaration(path) {
    code = t.ImportDeclaration(
      [t.ImportDefaultSpecifier(t.Identifier('SENTRY_PROVIDERS'))],
      t.StringLiteral('@core/sentry')
    );
    path.insertBefore(code);
  },
  ObjectProperty(path) {
    if (path.node.key.name === 'providers') {
      hasProviders = true;
      path.node.value.elements.push(t.identifier('SENTRY_PROVIDERS'));
    }
    if (!hasProviders && isEnd(path.getAllNextSiblings())) {
      hasProviders = false;
      path.insertAfter(
        t.objectProperty(t.identifier('providers'), t.arrayExpression())
      );
    }
  },
});

function isEnd(nodes) {
  return !nodes.some((item) => item.node.type === 'ObjectProperty');
}
console.log(generate(ast, {}, code).code);
// fs.writeFileSync(codePath, generate(ast, {}, code).code);
