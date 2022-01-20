function removeElement(nums, val) {
  let slowIndex = 0,
    fastIndex = 0;
  while (fastIndex < nums.length) {
    if (nums[fastIndex] !== val) {
      nums[slowIndex++] = nums[fastIndex];
    }
    fastIndex++;
  }
  return slowIndex;
}
removeElement([0, 1, 2, 2, 2, 3, 2], 2);
