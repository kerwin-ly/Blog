/**
 * @param {string} s
 * @param {number} n
 * @return {string}
 */
var reverseLeftWords = function (s, n) {
  let strArr = Array.from(s);
  reverseStr(strArr, 0, n - 1); // 旋转
  reverseStr(strArr, n, strArr.length - 1);
  reverseStr(strArr, 0, strArr.length - 1);
  return strArr.join('');
};

var reverseStr = function (strArr, start, end) {
  let left = start; // 左指针
  let right = end; // 右指针
  while (left < right) {
    [strArr[left], strArr[right]] = [strArr[right], strArr[left]]; // 交换左右指针的值
    left++;
    right--;
  }
};
reverseLeftWords('abcdefg', 2);
