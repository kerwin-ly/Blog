/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
var maxSlidingWindow = function (nums, k) {
  const queue = []; // 单调队列，单调递减
  const result = []; // 结果数组

  let max = nums[0];
  // 求出移动滑动窗口前，滑动窗口中的最大值
  for (let i = 1; i < k; i++) {
    if (max < nums[i]) {
      max = nums[i];
    }
  }
  queue.push(max);
  result.push(max);

  for (let i = k; i < nums.length; i++) {
    let front = queue[0]; // 队列头元素
    // 如果滑动窗口移除的元素刚好是上个滑动窗口的最大值，则将队列头部的值取出
    if (nums[i - k] === front) {
      queue.shift();
    }
    // 将队列尾部元素与当前元素一直比较，如果当前元素比队尾元素大，则移出队尾元素。直到当前元素比队尾元素小为止
    while (queue[queue.length - 1] < nums[i]) {
      queue.length--;
    }
    queue.push(nums[i]); // 将当前元素插入队尾
    result.push(queue[0]); // 将最大元素放入结果中
  }
  return result;
};
maxSlidingWindow([9, 10, 9, -7, -4, -8, 2, -6], 5);
