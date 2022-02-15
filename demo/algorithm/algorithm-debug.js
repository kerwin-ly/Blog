/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
  let stack = [];
  let leftBrackets = ['(', '{', '['];
  let rightBrackets = [')', '}', ']'];
  for (let i = 0; i < s.length; i++) {
    if (leftBrackets.includes(s[i])) {
      stack.push(s[i]);
      continue;
    }
    if (rightBrackets.includes(s[i])) {
      let top = stack.pop(); // 栈顶元素
      if (
        (s[i] === ')' && top === '(') ||
        (s[i] === '}' && top === '{') ||
        (s[i] === ']' && top === '[')
      ) {
        continue;
      } else {
        stack.push(top); // 将栈顶元素压回栈中
        stack.push(s[i]); // 将错误的括号也压入栈中
      }
    }
  }
  if (stack.length === 0) {
    return true;
  }
  return false;
};
isValid('(])');
