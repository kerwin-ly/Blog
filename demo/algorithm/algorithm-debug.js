/**
 * @param {string[]} tokens
 * @return {number}
 */
var evalRPN = function (tokens) {
  const stack = [];
  const operators = ['+', '-', '*', '/'];
  for (let i = 0; i < tokens.length; i++) {
    if (operators.includes(tokens[i])) {
      let temp1 = stack.pop(); // 栈顶元素
      let temp2 = stack.pop(); // 栈顶前一个元素
      let result = eval(temp2 + tokens[i] + temp1);
      stack.push(result);
    } else {
      stack.push(tokens[i]);
    }
  }
  return stack.pop();
};
evalRPN(['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']);
