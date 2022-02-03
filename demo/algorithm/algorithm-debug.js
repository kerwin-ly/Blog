/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
  const result = []; // 输出的结果数组
  const sortArr = nums.sort((a, b) => a - b); // 从小到大排序
  console.log(sortArr.length);
  for (let i = 0; i < sortArr.length; i++) {
    // 如果min指针右移时，下一个值和当前值相等，则跳过
    if (sortArr[i] === sortArr[i - 1]) {
      continue;
    }
    let min = i; // 左侧最小值
    let left = i + 1; // 左指针，除开最小值外的数组中的最小值
    let right = sortArr.length - 1; // 右指针，数组中的最大值
    // console.log(sortArr[min], sortArr[left], sortArr[right]);
    // 如果指针min和指针left的值相加大于0，则表明无论如何相加，结果都会大于0
    while (sortArr[min] + sortArr[left] < 0 && left < right) {
      // 如果三个值相加小于0，说明需要加值才能等于0，左指针右移
      if (sortArr[min] + sortArr[left] + sortArr[right] < 0) {
        // 如果在移动指针时，遇到当前值与上一个值相等，由于上次该值已经参与了计算，则继续移动指针。
        while (true) {
          left++;
          if (sortArr[left] !== sortArr[left - 1]) {
            break;
          }
        }
      }
      // 如果三个值相加大于0，说明需要减值才能等于0，右指针左移
      else if (sortArr[min] + sortArr[left] + sortArr[right] > 0) {
        // 如果在移动指针时，遇到当前值与上一个值相等，由于上次该值已经参与了计算，则继续移动指针。
        while (true) {
          right--;
          if (sortArr[right] !== sortArr[right + 1]) {
            break;
          }
        }
      } else {
        result.push([sortArr[min], sortArr[left], sortArr[right]]);
        while (true) {
          left++; // 右移左指针
          right--; // 左移右指针
          if (sortArr[left] !== sortArr[left - 1]) {
            break;
          }
          if (sortArr[right] !== sortArr[right + 1]) {
            break;
          }
          if (left >= right) {
            break;
          }
        }
      }
    }
  }
  console.log('result', result);
  return result;
};

threeSum([0, 0, 0]);
