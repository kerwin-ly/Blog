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
    // if (right - left + 1 > max) {
    //   max = right - left + 1;
    // }
    // sum++;
    if (!map.has(fruits[right])) {
      map.set(fruits[right], 1);
    } else {
      map.set(fruits[right], map.get(fruits[right]) + 1);
    }
    right++;
    // sum++;

    while (map.size > MAX_LENGTH) {
      if (map.get(fruits[left])) {
        map.set(fruits[left], map.get(fruits[left]) - 1);
      }
      // console.log(fruits[left] + '--' + map.get(fruits[left]));
      // let leftkey = fruits[left];
      if (map.get(fruits[left]) <= 0) {
        map.delete(fruits[left]);
      }

      // sum--;
      // 判断left的下一个水果是否在篮子中
      left++;
      // if (!map.has(fruits[left])) {
      //   map.set(fruits[left], left.toString());
      // }
    }
    if (right - left > max) {
      max = right - left;
    }
  }
  return max;
};
totalFruit([3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]);
// totalFruit([0, 1, 2, 2]);
