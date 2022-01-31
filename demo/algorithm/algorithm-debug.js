function Node(val) {
  this.val = val;
  this.next = null;
}
var MyLinkedList = function () {
  this.head = null;
};

/**
 * @param {number} index
 * @return {number}
 */
MyLinkedList.prototype.get = function (index) {
  let i = 0;
  let node = this.head;

  if (!this.head) {
    return -1;
  }
  while (node) {
    if (i === index) {
      return node.val;
    }
    i++;
    node = node.next;
  }
  return -1;
};

/**
 * @param {number} val
 * @return {void}
 */
MyLinkedList.prototype.addAtHead = function (val) {
  const newNode = new Node(val);
  newNode.next = this.head;
  this.head = newNode;
};

/**
 * @param {number} val
 * @return {void}
 */
MyLinkedList.prototype.addAtTail = function (val) {
  if (!this.head) {
    this.head = new Node(val);
    return;
  }
  let node = this.head;
  while (node.next) {
    node = node.next;
  }
  node.next = new Node(val);
};

/**
 * @param {number} index
 * @param {number} val
 * @return {void}
 */
MyLinkedList.prototype.addAtIndex = function (index, val) {
  if (index <= 0) {
    this.addAtHead(val);
    return;
  }
  const newNode = new Node(val);
  let pre = this.head;
  let cur = this.head.next;
  let i = 1;
  while (cur) {
    if (i === index) {
      console.log('pre', pre);
      pre.next = newNode;
      newNode.next = cur;
      return;
    }
    pre = cur;
    cur = cur.next;
    i++;
  }
  cur.next = newNode;
};

/**
 * @param {number} index
 * @return {void}
 */
MyLinkedList.prototype.deleteAtIndex = function (index) {
  if (index < 0) {
    return;
  }
  if (index === 0) {
    this.head = this.head.next;
    return;
  }
  let pre = this.head;
  let cur = this.head.next;
  let i = 1;
  while (cur) {
    if (i === index) {
      pre.next = cur.next;
      return;
    }
    i++;
    pre = cur;
    cur = cur.next;
  }
};

/**
 * Your MyLinkedList object will be instantiated and called as such:
 * var obj = new MyLinkedList()
 * var param_1 = obj.get(index)
 * obj.addAtHead(val)
 * obj.addAtTail(val)
 * obj.addAtIndex(index,val)
 * obj.deleteAtIndex(index)
 */

// var obj = new MyLinkedList();
// var param_1 = obj.get(index);
// obj.addAtHead(val);
// obj.addAtTail(val);
// obj.addAtIndex(index, val);
// obj.deleteAtIndex(index);
linkedList = new MyLinkedList();
linkedList.addAtHead(1);
linkedList.addAtTail(3);
linkedList.addAtIndex(1, 2); //链表变为1-> 2-> 3
linkedList.get(1); //返回2
linkedList.deleteAtIndex(1); //现在链表是1-> 3
linkedList.get(1); //返回3
