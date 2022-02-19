class Heap {
  constructor(arr) {
    // 堆从下标1开始，0作为哨兵，存储最大（小）值
    this.data = arr;
    this.size = arr.length - 1;
  }

  // 交换值
  swap(indexOne, indexTwo) {
    // const tmp = this.data[indexOne];
    // this.data[indexOne] = this.data[indexTwo];
    // this.data[indexTwo] = tmp;
    [this.data[indexOne], this.data[indexTwo]] = [
      this.data[indexTwo],
      this.data[indexOne],
    ];
  }

  // 获取左子节点的下标
  getLeftChildIndex(i) {
    return i * 2;
  }

  // 获取右子节点的下标
  getRightChildIndex(i) {
    return i * 2 + 1;
  }

  // 获取左子节点值
  getLeftChildItem(index) {
    return this.data[this.getLeftChildIndex(index)];
  }

  // 获取右子节点值
  getRightChildItem(index) {
    return this.data[this.getRightChildIndex(index)];
  }

  // 获取父节点下标
  getParentIndex(childIndex) {
    return Math.floor(childIndex / 2);
  }

  // 获取父节点值
  getParentItem(index) {
    return this.data[this.getParentIndex(index)];
  }

  // 判断某下标是否还有父节点
  hasParent(childIndex) {
    return this.getParentIndex(childIndex) >= 0;
  }

  // 判断是否含有子节点（如果子节点下标超出堆的大小，则说明不存在该子节点）
  hasLeftChild(parentIndex) {
    return this.getLeftChildIndex(parentIndex) <= this.size;
  }

  // 判断是否含有右子节点
  hasRightChild(parentIndex) {
    return this.getRightChildIndex(parentIndex) <= this.size;
  }

  // 构造大顶堆
  maxHeapify(i) {
    while (true) {
      let max = i;
      if (i > this.size) {
        return;
      }
      let left = this.getLeftChildIndex(i);
      let right = this.getRightChildIndex(i);

      if (left <= this.size && this.data[left] > this.data[max]) {
        max = left;
      }
      if (right <= this.size && this.data[right] > this.data[max]) {
        max = right;
      }
      if (max === i) {
        break;
      }
      this.swap(i, max);
      i = max;
    }
  }

  // 自下而上，对堆中元素进行替换
  heapifyUp(customStartIndex) {
    let currentIndex = customStartIndex || this.size;
    let parentIndex = this.getParentIndex(currentIndex);

    // 插入最后位置的元素，挨个与父级元素比较。
    // 如果插入元素比父级元素大，则与父级元素交换位置
    // 如果插入元素比父级元素小，则表明当前有序性正确，是大顶堆
    while (
      this.hasParent(currentIndex) &&
      this.data[parentIndex] < this.data[currentIndex]
    ) {
      this.swap(parentIndex, currentIndex);
      currentIndex = parentIndex;
      parentIndex = this.getParentIndex(currentIndex);
    }
  }

  // 自上而下，对堆中元素进行替换
  heapifyDown(customStartIndex = 1) {
    let currentIndex = customStartIndex;
    let nextIndex = null;

    // 当有子节点时
    while (this.hasLeftChild(currentIndex)) {
      // 取左子节点和右子节点的较大值
      if (
        this.hasRightChild(currentIndex) &&
        this.getRightChildItem(currentIndex) >
          this.getLeftChildItem(currentIndex)
      ) {
        nextIndex = this.getRightChildIndex(currentIndex);
      } else {
        nextIndex = this.getLeftChildIndex(currentIndex);
      }
      // 如果当前节点比左右子节点的较大值更大，则表明有序性已满足，退出循环。
      if (this.data[currentIndex] > this.data[nextIndex]) {
        break;
      }
      // 如果当前节点比左右子节点的较大值小，将左右子节点的较大值和当前节点进行交换
      this.swap(currentIndex, nextIndex);
      currentIndex = nextIndex;
    }
  }

  // 构建大顶堆
  buildMaxHeap() {
    const lastParentIndex = Math.floor(this.size / 2); // 最后一个非叶子节点开始（即：最后一个有子节点的节点开始）

    for (let i = lastParentIndex; i >= 1; --i) {
      this.maxHeapify(i);
    }
  }

  // 插入
  add(item) {
    this.data.push(item); // 1.将插入元素放在数组最后一个位置，首先保证结构性
    this.size++;
    this.heapifyUp(); // 2.再根据各个父子节点值的大小，逐个调整树节点位置
    return this;
  }

  // 删除堆顶元素
  pop() {
    this.data[1] = this.data.pop();
    this.size--;
    this.heapifyDown();
  }

  // 删除（测试使用，堆中一般情况仅删除堆顶元素）
  remove(removeIndex) {
    if (removeIndex >= this.size) {
      return;
    }
    // 如果删除的是最后一个元素，则保证了堆的特征
    if (removeIndex === this.size) {
      this.data.pop();
      this.size--;
      return;
    }
    this.data[removeIndex] = this.data.pop(); // 将末尾的元素放置到删除位置上，保证堆的结构性
    this.size--;
    const parentItem = this.getParentItem(removeIndex);
    // 如果父元素比替换的元素小，则向上查找替换元素的正确位置
    // 否则，向下查找替换元素的正确位置
    if (parentItem && parentItem < this.data[removeIndex]) {
      this.heapifyUp(removeIndex);
    } else {
      this.heapifyDown(removeIndex);
    }
  }

  // 堆排序（测试使用）
  sort() {
    this.buildMaxHeap();
    for (let i = this.data.length - 1; i > 1; i--) {
      this.swap(1, i);
      this.size--;
      this.maxHeapify(1);
    }
  }
}
const h1 = new Heap([, 10, 4, 6, 7, 3, 23, 89, 45]);

h1.buildMaxHeap();
h1.add(100);
h1.pop();
h1.pop();
console.log('maxHeap is', h1.data);
h1.sort();
console.log('sort data', h1.data);
