const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';

const boolTag = '[object Boolean]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const numberTag = '[object Number]';
const regexpTag = '[object RegExp]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';

iterableTags = [mapTag, setTag, arrayTag, objectTag];

// 判断是否为基础类型 or 对象
function isObject(target) {
  const type = typeof target;
  return target !== null && (type === 'object' || type === 'function');
}

// 获取对象的具体类型
function getType(target) {
  return Object.prototype.toString.call(target);
}

// 使用weakMap解决循环引用的问题，防止强引用中的key无法被垃圾回收
function deepClone(obj, map = new WeakMap()) {
  if (!isObject(obj)) {
    return obj;
  }

  const type = getType(obj);
  let cloneObj;
  if (!iterableTags.includes(type)) {
    return cloneOtherType(obj);
  }
  cloneObj = getConstructor(obj);

  // Map类型
  if (type === mapTag) {
    obj.forEach((value, key) => {
      cloneObj.set(key, deepClone(value, map));
    });
    return cloneObj;
  }

  // Set类型
  if (type === setTag) {
    obj.forEach((value, key) => {
      cloneObj.add(key, deepClone(value, map));
    });
    return cloneObj;
  }

  // 数组和对象
  isArray = Array.isArray(obj);
  cloneObj = isArray ? [] : {};
  if (map.get(obj)) {
    return map.get(obj);
  }
  map.set(obj, cloneObj);

  for (const key in obj) {
    cloneObj[key] = deepClone(obj[key], map);
  }
  return cloneObj;

  // 使用while循环遍历性能更佳
  // const keys = isArray ? undefined : Object.keys(obj);
  // forEach(keys || obj, (value, key) => {
  //   if (keys) {
  //     key = value; // 当是对象时，遍历的数组存的是字符串key
  //   }
  //   cloneObj[key] = deepClone(obj[key], map);
  // });
}

// 克隆其他类型。（其value无法继续递归克隆的情况）
function cloneOtherType(targe, type) {
  const Ctor = targe.constructor;
  switch (type) {
    case boolTag:
    case numberTag:
    case stringTag:
    case errorTag:
    case dateTag:
      return new Ctor(targe);
    case regexpTag:
      return cloneReg(targe);
    case symbolTag:
      return cloneSymbol(targe);
    default:
      return null;
  }
}

// 克隆symbol
function cloneSymbol(targe) {
  return Object(Symbol.prototype.valueOf.call(targe));
}

// 克隆正则
function cloneReg(targe) {
  const reFlags = /\w*$/;
  const result = new targe.constructor(targe.source, reFlags.exec(targe));
  result.lastIndex = targe.lastIndex;
  return result;
}

// 初始化构造函数
function getConstructor(target) {
  const Ori = target.constructor;
  return new Ori();
}

function forEach(arr, cb) {
  let index = -1;
  while (++index < arr.length) {
    cb(arr[index], index);
  }
  return arr;
}

const temp = {
  a: 1,
  hi: new Map(),
  hs: new Set(),
  hj: new RegExp(),
  fn: function () {},
  b: {
    c: {
      d: 4,
    },
    g: {
      f: 5,
    },
    child: 'child',
    gg: undefined,
    h: {
      i: [1, 2, 4],
      g: {
        f: 5,
        g: {
          f: 5,
        },
      },
    },
  },
};
temp.temp = temp;
console.log(deepClone(temp));
