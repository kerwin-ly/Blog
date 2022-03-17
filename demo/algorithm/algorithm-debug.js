function getType(val) {
  return Object.prototype.toString.call(val);
}
function deepClone(obj) {
  if (getType(obj) === 'object Object') {
    const newObj = Array.isArray(obj) ? [] : {}; // 这里对类型进行判断，返回空数组或空对象
    for (const key in obj) {
      newObj[key] = deepClone(obj[key]);
    }
    return newObj;
  } else {
    return obj;
  }
}

const obj = {
  name: 'kerwin',
  info: {
    age: 27,
    detail: {
      department: '技术部',
    },
  },
  list: [{ age: 12 }, 2, 3], //
};
const newObj = deepClone(obj);
console.log(newObj);
// {
//   name: 'kerwin',
//   info: { age: 27, detail: { department: '技术部' } },
//   list: [ { age: 12 }, 2, 3 ]
// }
