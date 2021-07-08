const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default; // 遍历ast，对各个节点进行处理
const generate = require('@babel/generator').default; // 将ast转换生成代码
const t = require('@babel/types');
const path = require('path');
const fs = require('fs');
const codePath = './code/demo.ts'; // 待解析代码路径，
const file = fs.readFileSync(path.resolve(__dirname, codePath)).toString();
const ast = parse(file, {
  sourceType: 'module',
  plugins: ['decorators-legacy', 'typescript'], // decorators-legacy: 待解析代码中包含装饰器；typescript：待分析代码中包含类型声明等ts特性
});
let code;
let hasProviders = false;

traverse(ast, {
  ClassDeclaration(path) {
    const local = t.Identifier('SENTRY_PROVIDERS');
    const imported = t.Identifier('SENTRY_PROVIDERS');
    const specifiers = [t.ImportSpecifier(local, imported)];
    const source = t.stringLiteral('@core/sentry');
    const importDeclaration = t.importDeclaration(specifiers, source);

    path.insertBefore(importDeclaration); // 在当前ClassDeclaration节点前插入importDeclaration节点
  },
  ObjectProperty(path) {
    // ObjectProperty 对应js语法中的键值对, xx: xx
    if (path.node.key.name === 'providers') {
      // 这里判断，如果代码中已经存在 key值 providers，直接进行添加
      hasProviders = true;
      path.node.value.elements.push(t.identifier('SENTRY_PROVIDERS')); // path.node.value.elements可以通过AST Explorer来查看对应层级
    }
    if (!hasProviders && isEnd(path.getAllNextSiblings())) {
      // 判断如果遍历到最后一个ObjectProperty，仍没有providers属性，则添加键值对
      hasProviders = false;
      // 在当前节点后面添加一个键值对
      path.insertAfter(
        t.objectProperty(t.identifier('providers'), t.arrayExpression())
      );
    }
  },
});

function isEnd(nodes) {
  return !nodes.some((item) => item.node.type === 'ObjectProperty');
}

fs.writeFileSync(codePath, generate(ast, {}, code).code);
console.log('Success to generate it');
