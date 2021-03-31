const _ = require('underscore');

exports.JSONPATH_JOIN_CHAR = '.';
exports.lang = 'zh_CN';
exports.format = [
  { name: 'date-time' },
  { name: 'date' },
  { name: 'email' },
  { name: 'hostname' },
  { name: 'ipv4' },
  { name: 'ipv6' },
  { name: 'uri' }
];

exports.SCHEMA_TYPE = ['string', 'number', 'array', 'object', 'boolean', 'integer'];
const defaultSchema = {
  string: {
    type: 'string'
  },
  number: {
    type: 'number'
  },
  array: {
    type: 'array',
    items: {
      type: 'string'
    }
  },
  object: {
    type: 'object',
    properties: {}
  },
  boolean: {
    type: 'boolean'
  },
  integer: {
    type: 'integer'
  }
}
exports.defaultSchema = defaultSchema;

// 防抖函数，减少高频触发的函数执行的频率
// 请在 constructor 里使用:

// this.func = debounce(this.func, 400);
exports.debounce = (func, wait) => {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
};

function getData(state, keys) {
  let curState = state;
  for (let i = 0; i < keys.length; i++) {
    curState = curState[keys[i]];
  }
  return curState;
}

exports.getData = getData;

exports.setData = function (state, keys, value) {
  let curState = state;
  for (let i = 0; i < keys.length - 1; i++) {
    curState = curState[keys[i]];
  }
  curState[keys[keys.length - 1]] = value;
};

exports.deleteData = function (state, keys) {
  let curState = state;
  for (let i = 0; i < keys.length - 1; i++) {
    curState = curState[keys[i]];
  }

  delete curState[keys[keys.length - 1]];
};

exports.getParentKeys = function (keys) {
  if (keys.length === 1) return [];
  let arr = [].concat(keys);
  arr.splice(keys.length - 1, 1);
  return arr;
};

exports.clearSomeFields = function (keys, data) {
  const newData = Object.assign({}, data);
  keys.forEach(key => {
    delete newData[key];
  });
  return newData;
};

function getFieldstitle(data) {
  const requiredtitle = [];
  Object.keys(data).map(title =>requiredtitle.push(title));

  return requiredtitle;
}

function handleSchemaRequired(schema, checked) {
  // console.log(schema)
  if (schema.type === 'object') {
    let requiredtitle = getFieldstitle(schema.properties);

    // schema.required = checked ? [].concat(requiredtitle) : [];
    if (checked) {
      schema.required = [].concat(requiredtitle);
    } else {
      delete schema.required;
    }

    handleObject(schema.properties, checked);
  } else if (schema.type === 'array') {
    handleSchemaRequired(schema.items, checked);
  } else {
    return schema;
  }
}

function handleObject(properties, checked) {
  for (var key in properties) {
    if (properties[key].type === 'array' || properties[key].type === 'object')
      handleSchemaRequired(properties[key], checked);
  }
}

exports.handleSchemaRequired = handleSchemaRequired;

function cloneObject(obj) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      var newArr = [];
      obj.forEach(function (item, index) {
        newArr[index] = cloneObject(item);
      });
      return newArr;
    } else {
      var newObj = {};
      for (var key in obj) {
        newObj[key] = cloneObject(obj[key]);
      }
      return newObj;
    }
  } else {
    return obj;
  }
}

exports.cloneObject = cloneObject;

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

const isObject = a =>
  stringContains(Object.prototype.toString.call(a), 'Object');
exports.isObject = isObject;
/** 支持的展示形式 */
const UI_TYPE = [
  { label: '输入框', value: 'input' },
  { label: '文本域', value: 'textarea' },
  { label: '日期', value: 'date', format:'date' },
  { label: '开关', value: 'switch' },
  { label: '单选框', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
  { label: '下拉单选', value: 'select' },
  { label: '下拉多选', value: 'multiSelect' },
  { label: '日期范围', value: 'range' },
  { label: '滑动条', value: 'slider' },
  { label: '图片展示', value: 'image', format:'image' },
  { label: '颜色选择', value: 'color' },
  { label: '文件上传', value: 'upload' },
  { label: '组', value: 'object' },
  { label: '列表', value: 'array' },
  { label: '是否选择', value: 'checkbox' },
];
exports.UI_TYPE = UI_TYPE;

function filterStringUiType(format) {
  switch (format) {
    case 'date':
    case 'date-time':
      return _.filter(UI_TYPE, (item) => ['输入框', '日期'].includes(item.label));
    default:
      return _.filter(UI_TYPE, (item) => ['输入框', '文本域', '日期选择', '单选框', '下拉单选', '图片展示',  '文件上传'].includes(item.label));
  }
}

function filterUiType(field, format) {
  switch (field) {
    case 'number':
    case 'integer':
      return _.filter(UI_TYPE, (item) => ['输入框'].includes(item.label));
    case 'string':
      return filterStringUiType(format);
    case 'array':
      return _.filter(UI_TYPE, (item) => ['列表','复选框', '下拉多选', '日期范围'].includes(item.label));
    case 'boolean':
      return _.filter(UI_TYPE, (item) => ['是否选择', '开关'].includes(item.label));
    case 'object':
      return _.filter(UI_TYPE, (item) => ['组'].includes(item.label));
    default:
      return _.filter(UI_TYPE, (item) => ['输入框', '文本域', '日期', '单选框', '下拉单选', '图片展示', '文件上传'].includes(item.label));
  }
}

exports.filterUiType = filterUiType;

function filterUiTypeDefaultValue(field) {
  return filterUiType(field) && filterUiType(field)[0] && filterUiType(field)[0].value;
}


exports.defaultSchemaUi = function (field) {
  return field === 'array' ? {
    'ui:widget': filterUiTypeDefaultValue(field),
    type:field,
    items: {
      'ui:widget': filterUiTypeDefaultValue('string'),
      type:'string'
    }
  } : { 'ui:widget': filterUiTypeDefaultValue(field), type:field }
}

exports.filterUiTypeDefaultValue = filterUiTypeDefaultValue;


exports.getUiData = function getUiData(state, keys) {
  let curState = state;
  // for (let i = 0; i < keys.length; i++) {
  //   curState = curState ? curState[keys[i]] : {};
  // }
  return curState;
}

exports.setUiData = function setUiData(state, keys, value, data) {
  let curState = state;
  if (keys.length === 0) {
    curState = Object.assign(curState, value);
  } else {
    for (let i = 0; i < keys.length - 1; i++) {
      curState = curState ? curState[keys[i]] : {};
    }
    curState[keys[keys.length - 1]] = value;
  }
};

exports.deleteUiData = function deleteUiData(state, keys) {
  // let curState = state;
  // for (let i = 0; i < keys.length - 1; i++) {
  //   curState = curState ? curState[keys[i]] : {};
  // }

  // delete curState[keys[keys.length - 1]];
};


// 获得propsSchema的children
function getChildren(schema) {
  if (!schema) return [];
  const {
    // object
    properties,
    // array
    items,
    type,
  } = schema;
  if (!properties && !items) {
    return [];
  }
  let schemaSubs = {};
  if (type === 'object') {
    schemaSubs = properties;
  }
  if (type === 'array') {
    schemaSubs = items;
  }
  return Object.keys(schemaSubs).map(name => ({
    schema: schemaSubs[name],
    name,
  }));
}

// ----------------- schema 相关

// 合并propsSchema和UISchema。由于两者的逻辑相关性，合并为一个大schema能简化内部处理
function combineSchema(propsSchema = {}, uiSchema = {}) {
  const propList = getChildren(propsSchema);
  const newList = propList.map(p => {
    const { name } = p;
    const { type, enum: options, properties, items } = p.schema;
    const isObj = type === 'object' && properties;
    const isArr = type === 'array' && items && !options; // enum + array 代表的多选框，没有sub
    const ui = name && uiSchema[p.name];
    if (!ui) {
      return p;
    }
    // 如果是list，递归合并items
    if (isArr) {
      const newItems = combineSchema(items, ui.items || {});
      return { ...p, schema: { ...p.schema, ...ui, items: newItems } };
    }
    // object递归合并整个schema
    if (isObj) {
      const newSchema = combineSchema(p.schema, ui);
      return { ...p, schema: newSchema };
    }
    return { ...p, schema: { ...p.schema, ...ui } };
  });

  const newObj = {};
  newList.forEach(s => {
    newObj[s.name] = s.schema;
  });

  const topLevelUi = {};
  Object.keys(uiSchema).forEach(key => {
    if (typeof key === 'string' && key.substring(0, 3) === 'ui:') {
      topLevelUi[key] = uiSchema[key];
    }
  });
  if (isEmpty(newObj)) {
    return { ...propsSchema, ...topLevelUi };
  }
  return { ...propsSchema, ...topLevelUi, properties: newObj };
}

exports.combineSchema = combineSchema;

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}