var MyStack = function () {
  this.queue = [];
};

/**
 * @param {number} x
 * @return {void}
 */
MyStack.prototype.push = function (x) {
  this.queue.push(x);
};

/**
 * @return {number}
 */
MyStack.prototype.pop = function () {
  let i = 0;
  let temp = null;
  while (i < this.queue.length) {
    temp = this.queue.shift();
    // 队列末尾元素（即栈顶元素）不再添加到队列中
    if (i < this.queue.length - 1) {
      this.queue.push(temp);
    }
    i++;
  }
  return temp;
};

/**
 * @return {number}
 */
MyStack.prototype.top = function () {
  let i = 0;
  let temp = null;
  while (i < this.queue.length) {
    temp = this.queue.shift();
    this.queue.push(temp);
    i++;
  }
  return temp;
};

/**
 * @return {boolean}
 */
MyStack.prototype.empty = function () {
  if (!this.queue.length) {
    return true;
  }
  return false;
};

/**
 * Your MyStack object will be instantiated and called as such:
 * var obj = new MyStack()
 * obj.push(x)
 * var param_2 = obj.pop()
 * var param_3 = obj.top()
 * var param_4 = obj.empty()
 */
/**
 * Your MyStack object will be instantiated and called as such:
 * var obj = new MyStack()
 * obj.push(x)
 * var param_2 = obj.pop()
 * var param_3 = obj.top()
 * var param_4 = obj.empty()
 */
const stack = new MyStack();
stack.push(1);
stack.push(2);
stack.top();
stack.pop();
stack.empty();
