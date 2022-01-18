// // var searchRange = function (nums, target) {
// //   const getLeftBorder = (nums, target) => {
// //     let left = 0,
// //       right = nums.length - 1;
// //     let leftBorder = -2; // 记录一下leftBorder没有被赋值的情况
// //     while (left <= right) {
// //       let middle = left + ((right - left) >> 1);
// //       if (target <= nums[middle]) {
// //         // 寻找左边界，nums[middle] == target的时候更新right
// //         right = middle - 1;
// //         leftBorder = right;
// //       } else {
// //         left = middle + 1;
// //       }
// //     }
// //     return leftBorder;
// //   };

// //   const getRightBorder = (nums, target) => {
// //     let left = 0,
// //       right = nums.length - 1;
// //     let rightBorder = -2; // 记录一下rightBorder没有被赋值的情况
// //     while (left <= right) {
// //       let middle = left + ((right - left) >> 1);
// //       if (target < nums[middle]) {
// //         right = middle - 1;
// //       } else {
// //         // 寻找右边界，nums[middle] == target的时候更新left
// //         left = middle + 1;
// //         rightBorder = left;
// //       }
// //     }
// //     return rightBorder;
// //   };

// //   let leftBorder = getLeftBorder(nums, target);
// //   let rightBorder = getRightBorder(nums, target);
// //   // 情况一
// //   if (leftBorder === -2 || rightBorder === -2) return [-1, -1];
// //   // 情况三
// //   if (rightBorder - leftBorder > 1) return [leftBorder + 1, rightBorder - 1];
// //   // 情况二
// //   return [-1, -1];
// // };
// /**
//  * @param {number[]} nums
//  * @param {number} target
//  * @return {number[]}
//  */
// var searchRange = function (nums, target) {
//   const getLeftBorder = (nums, target) => {
//     let left = 0;
//     let right = nums.length - 1;
//     let leftBorder = null;
//     let mid;
//     let pivot;
//     while (left <= right) {
//       mid = Math.floor((right - left) / 2) + left;
//       pivot = nums[mid];

//       if (target < pivot) {
//         right = mid - 1;
//       } else if (target > pivot) {
//         left = mid + 1;
//       } else {
//         right = mid - 1;
//         // 由于是获取左边界，将右边界固定，来缩小左边界范围
//         leftBorder = mid;
//       }
//     }
//     if (leftBorder === null) return -1;
//     return leftBorder;
//   };
//   const getRightBorder = (nums, target) => {
//     let left = 0;
//     let right = nums.length - 1;
//     let rightBorder = null;
//     let mid;
//     let pivot;
//     while (left <= right) {
//       mid = Math.floor((right - left) / 2) + left;
//       pivot = nums[mid];

//       if (target < pivot) {
//         right = mid - 1;
//       } else if (target > pivot) {
//         left = mid + 1;
//       } else {
//         left = mid + 1;
//         // 由于是获取右边界，将左边界固定，来缩小右边界范围
//         rightBorder = mid;
//       }
//     }
//     if (rightBorder === null) return -1;
//     return rightBorder;
//   };
//   const leftBorder = getLeftBorder(nums, target);
//   const rightBorder = getRightBorder(nums, target);
//   return [leftBorder, rightBorder];
// };

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var searchRange = function (nums, target) {
  const getBorder = (nums, target, type) => {
    let left = 0;
    let right = nums.length - 1;
    let border = null;
    while (left <= right) {
      const mid = Math.floor((right - left) / 2) + left;
      const pivot = nums[mid];

      if (target < pivot) {
        right = mid - 1;
      } else if (target > pivot) {
        left = mid + 1;
      } else {
        // 如果target === pivot
        if (type === 'left') {
          // 如果寻找左边界值，则将右指针左移，缩小左侧数组范围
          right = mid - 1;
          border = mid;
        } else {
          // 如果寻找右边界值，则将左指针右移，缩小右侧数组范围
          left = mid + 1;
          border = mid;
        }
      }
    }
    if (border === null) return -1;
    return border;
  };

  const leftBorder = getBorder(nums, target, 'left');
  const rightBorder = getBorder(nums, target, 'right');
  return [leftBorder, rightBorder];
};
searchRange([5, 7, 7, 8, 8, 9], 8);
