/**
 * @param {number[]} fruits
 * @return {number}
 */
var totalFruit = function (fruits) {
  // 滑动窗口求解
  let left = 0;
  let right = 0;
  const MAX_LENGTH = 2; // 已采摘的水果种类，最多2种
  let max = 0; // 已采摘的水果种类
  const map = new Map();

  while (right < fruits.length) {
    // sum++;
    if (!map.has(fruits[right])) {
      map.set(fruits[right], true);
    }

    // sum++;

    if (right - left + 1 > max) {
      max = right - left + 1;
    }

    while (map.size > MAX_LENGTH) {
      map.delete(fruits[left]);
      // sum--;
      // 判断left的下一个水果是否在篮子中
      left++;
      if (!map.has(fruits[left])) {
        map.set(fruits[left], left.toString());
      }
    }
  }
  return max;
};
totalFruit([3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]);
