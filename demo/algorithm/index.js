/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function (target, nums) {
  let left = -1;
  let right = 0;
  let sum = 0;
  let minLen = null;
  while (left <= right && right === nums.length - 1) {
    nums[left] = typeof nums[left] === undefined ? 0 : nums[left];
    sum = sum + nums[left] + nums[right];
    if (sum < target) {
      right++;
    } else {
      if (right - left < minLen || minLen === null) {
        minLen = right - left;
      }
      left++;
    }
  }
  return minLen === null ? 0 : minLen;
};
minSubArrayLen(7, [2, 3, 1, 2, 4, 3]);
