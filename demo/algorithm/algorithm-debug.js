/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 */
var strStr = function (haystack, needle) {
  if (needle === '') {
    return 0;
  }
  const next = getNextArr(needle);
  let j = 0; // needle字符串匹配位置
  for (let i = 0; i < haystack.length; i++) {
    // 如果字符不相等，先根据前缀表挪动j的位置，在与坐标i的字符进行比较
    // j必须大于0，否则越界
    while (j > 0 && haystack[i] !== needle[j]) {
      j = next[j - 1]; // 根据j的前一个位置的下标值，挪动j
    }
    // 如果字符相等，则两个指针往后挪一位，继续比较
    if (haystack[i] === needle[j]) {
      j++;
    }
    // j已匹配完needle的最后一个字符
    if (j === needle.length) {
      return i - needle.length + 1; // 返回开始匹配的位置
    }
  }
  return -1;
};

// 获取前缀表
var getNextArr = function (needle) {
  let j = 0; // 前缀末尾，同时表示i之前（包含i）的子串的最长相等前后缀长度
  const next = [0]; // 当只有一个字符的时候，前缀即后缀，取前缀则后缀为空。所以最长前后缀长度为0。
  for (let i = 1; i < needle.length; i++) {
    // 如果前后缀不相等，先移动j的位置。移动完后再与i位置进行比较
    while (j > 0 && needle[i] !== needle[j]) {
      j = next[j - 1]; // 将j重置为前一位next数组下标的值
    }
    // i 为后缀末尾
    // 如果前缀和后缀相等，则j+1
    if (needle[i] === needle[j]) {
      j++; // 最长相等前后缀长度 + 1
    }
    next[i] = j; // 记录当前子串的最长相等前后缀长度
  }
  return next;
};
// strStr('a', 'a');

strStr('aabaaabaaac', 'aabaaac');
