/**
 * @param {string} ransomNote
 * @param {string} magazine
 * @return {boolean}
 */
var canConstruct = function (ransomNote, magazine) {
  const map = new Map();
  // 遍历magazine字符，将字母添加到哈希表中
  for (let i = 0; i < magazine.length; i++) {
    if (!map.has(magazine[i])) {
      map.set(magazine[i], 1); // 记录该字母出现一次
    } else {
      map.set(magazine[i], map.get(magazine[i]) + 1);
    }
  }
  // 遍历ransomNote判断字母是否存在于哈希表中
  for (let j = 0; j < ransomNote.length; j++) {
    let count = map.get(ransomNote[j]);
    if (count >= 0) {
      map.set(ransomNote[j], count - 1);
    } else {
      return false;
    }
  }
  return true;
};
canConstruct('aa', 'ab');
