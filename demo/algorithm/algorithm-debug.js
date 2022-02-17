var maxSlidingWindow = function (nums, k) {
  const queue = []; // 单调递减队列，存储数组的下标
  const result = []; // 结果数组

  for (let i = 0; i < nums.length; i++) {
    // 将队列尾部元素与当前元素比较，如果当前元素比队尾元素大，则移出队尾元素。直到当前元素比队尾元素小为止
    // 这样做是为了保证队列的单调递减
    while (queue.length && nums[queue[queue.length - 1]] <= nums[i]) {
      queue.pop(); // 删除队尾元素
    }
    queue.push(nums[i]); // 将当前元素插入队尾
    // 如果滑动窗口区间的最左侧 大于等于 队头下标，则将队头删除
    if (i - k >= queue[0]) {
      queue.shift();
    }
    // 如果遍历i，已达到滑动窗口的尾部。说明一次滑动窗口区间的值已经处理完，向结果数组中添加当前窗口的最大值
    if (i >= k - 1) {
      result.push(nums[queue[0]]); // 将最大元素放入结果中
    }
  }
  return result;
};
maxSlidingWindow([3, 3, 5, 5, 6, 7], 3);
