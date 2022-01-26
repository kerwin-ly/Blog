/**
 * @param {number} n
 * @return {number[][]}
 */
var generateMatrix = function (n) {
  let row = 0; // 行数
  let col = 0; // 列数
  let loop = Math.floor(n / 2); // 循环的圈数
  let res = new Array(n).fill(0).map((item) => new Array(n).fill(0)); // 构造二维数组
  let startX = 0; // 横坐标开始位置
  let startY = 0; // 纵坐标开始位置
  let fillNum = n - 1; // 每一层需填充的数字数量
  let count = 1; // 记录当前填充数字
  while (loop--) {
    // 每次循环圈数时，为左闭右开区间[起始位置，结束为止)
    // 从左到右填充
    row = startX;
    col = startY;
    for (let i = 0; i < fillNum; i++) {
      res[row][col] = count;
      count++;
      col++;
    }
    // 从上到下
    for (let i = 0; i < fillNum; i++) {
      res[row][col] = count;
      count++;
      row++;
    }
    // 从右到左
    for (let i = 0; i < fillNum; i++) {
      res[row][col] = count;
      count++;
      col--;
    }
    // 从下到上
    for (let i = 0; i < fillNum; i++) {
      res[row][col] = count;
      count++;
      row--;
    }
    fillNum -= 2; //  下一圈每行（每列）的填充的个数为上一次填充每行（每列）的填充个数减2
    startX++; // 更新下一圈的起始行位置
    startY++; // 更新下一圈的起始列位置
  }
  if (n % 2 !== 0) {
    // 判断如果是奇数时，最中间位置手动填充。（填充最后一个值，不算一圈）
    const mid = Math.floor(n / 2);
    res[mid][mid] = n * n;
  }
  return res;
};
console.log(generateMatrix(5));
