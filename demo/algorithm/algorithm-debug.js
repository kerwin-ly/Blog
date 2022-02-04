/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function (nums, target) {
  const sortArr = nums.sort((a, b) => a - b);
  const result = [];
  // 当固定倒数第四个数时，右侧三个数也被固定了
  for (let i = 0; i < sortArr.length - 3; i++) {
    // 去重i
    if (sortArr[i] === sortArr[i - 1] && i > 0) {
      continue;
    }
    // 固定倒数第三个数，右侧剩余两个数也被固定
    for (let j = i + 1; j < sortArr.length - 2; j++) {
      //  去重j，注意判定j > i + 1，每次j开始的位置，其j-1位置可能和当前值相等，需要剔除这种情况
      if (sortArr[j] === sortArr[j - 1] && j > i + 1) {
        continue;
      }
      let left = j + 1; // 左指针
      let right = sortArr.length - 1; // 右指针
      while (left < right) {
        // sum < target,左指针右移
        if (sortArr[i] + sortArr[j] + sortArr[left] + sortArr[right] < target) {
          while (true) {
            left++;
            // 如果移动后的左指针值等于上一个值，则继续往右移动
            if (sortArr[left] !== sortArr[left - 1]) {
              break;
            }
          }
        }
        // sum > target,右指针左移
        else if (
          sortArr[i] + sortArr[j] + sortArr[left] + sortArr[right] >
          target
        ) {
          while (true) {
            right--;
            // 如果移动后的右指针值等于上一个值，则继续往左移动
            if (sortArr[right] !== sortArr[right + 1]) {
              break;
            }
          }
        }
        // 如果sum = target
        else {
          result.push([sortArr[i], sortArr[j], sortArr[left], sortArr[right]]);
          // 同时将左右指针向中间移动
          while (true) {
            left++;
            // 如果移动后的左指针值等于上一个值，则继续往右移动
            if (sortArr[left] !== sortArr[left - 1] || left >= right) {
              break;
            }
          }
          while (true) {
            right--;
            // 如果移动后的右指针值等于上一个值，则继续往左移动
            if (sortArr[right] !== sortArr[right + 1] || left >= right) {
              break;
            }
          }
        }
      }
    }
  }
  return result;
};
fourSum([-2, -1, -1, 1, 1, 2, 2]);
