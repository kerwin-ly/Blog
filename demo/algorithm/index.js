// var lengthOfLongestSubstring = function (s) {
//   // 使用滑动窗口处理
//   if (!s.length) {
//     return 0;
//   }
//   // let left = 0;
//   let right = -1; // 从-1开始，指针右移
//   let max = 0;
//   const map = new Map();
//   for (let i = 0; i < s.length; i++) {
//     // left = i; // 左指针右移
//     // if (map.get(s[i])) {
//     //   // 如果左指针移动中，发现值重复，则删除该值，继续移动左指针
//     //   map.delete(s[i]);
//     // }
//     if (i !== 0) {
//       map.delete(s[i - 1]);
//     }
//     while (!map.get(s[right + 1]) && right + 1 < s.length) {
//       map.set(s[right + 1], (right + 1).toString());
//       right++; // 指针右移
//     }

//     max = Math.max(max, right - i + 1);
//   }
//   return max;
// };
// lengthOfLongestSubstring('aab');
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
 var search = function(nums, target) {
  // 1. 取数组中间的值pivot与target进行比较
  // 2. 如果target小于pivot，则说明target在数组左侧；如果target大于pivot，则说明target在数组右侧
  // 3. 重复第二步，直到target等于pivot 或 nums.length === 1，否则输出-1
  let left = 0;
  let right = nums.length - 1;

  if (left <= right) {
      let index = Math.floor((right - left) / 2) + left;
      let pivot = nums[index];
      if (target < pivot) {
          right = index - 1;
      } else if (target > pivot) {
          left = index + 1;
      } else {
          return index;
      }
      // return -1;
  }
};

search([-1, 0, 3, 5, 9, 12], 9)