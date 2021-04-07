import _ from 'lodash';

let lang = 'zh_CN';

export function setLang(configLang) {
  lang = configLang;
}

export function getLang() {
  return lang;
}

export const JSONPATH_JOIN_CHAR = '.';
export const format = [
  { name: 'date-time' },
  { name: 'date' },
  { name: 'email' },
  { name: 'hostname' },
  { name: 'ipv4' },
  { name: 'ipv6' },
  { name: 'uri' }
];

export const SCHEMA_TYPE = ['string', 'number', 'array', 'object', 'boolean', 'integer'];
export const defaultSchema = {
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

// 防抖函数，减少高频触发的函数执行的频率
// 请在 constructor 里使用:

// this.func = debounce(this.func, 400);
export const debounce = (func, wait) => {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
};

export function getData(state, keys) {
  let curState = state;
  for (let i = 0; i < keys.length; i++) {
    curState = curState[keys[i]];
  }
  return curState;
}
export function setData(state, keys, value) {
  let curState = state;
  for (let i = 0; i < keys.length - 1; i++) {
    curState = curState[keys[i]];
  }
  curState[keys[keys.length - 1]] = value;
};

export function deleteData(state, keys) {
  let curState = state;
  for (let i = 0; i < keys.length - 1; i++) {
    curState = curState[keys[i]];
  }

  delete curState[keys[keys.length - 1]];
};

export function getParentKeys(keys) {
  if (keys.length === 1) return [];
  let arr = [].concat(keys);
  arr.splice(keys.length - 1, 1);
  return arr;
};

export function clearSomeFields(keys, data) {
  const newData = Object.assign({}, data);
  keys.forEach(key => {
    delete newData[key];
  });
  return newData;
};

function getFieldstitle(data) {
  const requiredtitle = [];
  Object.keys(data).map(title => requiredtitle.push(title));

  return requiredtitle;
}

export function handleSchemaRequired(schema, checked) {
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

export function cloneObject(obj) {
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

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

export const isObject = a =>
  stringContains(Object.prototype.toString.call(a), 'Object');
/** 支持的展示形式 */
export const UI_TYPE = [
  { label: '输入框', value: 'input', uiKey: 'string-input' },
  { label: '数字输入框', value: 'number', uiKey: 'string-number' },
  { label: '滑动条', value: 'slider', uiKey: 'string-slider' },
  { label: '文本域', value: 'textarea', uiKey: 'string-textarea' },
  { label: '图片展示', value: 'image', format: 'image', uiKey: 'string-image' },
  { label: '颜色选择', value: 'color', uiKey: 'string-color' },
  { label: '日期选择', value: 'date', format: 'date', uiKey: 'string-date' },
  { label: '日期时间', value: 'date', format: 'dateTime', uiKey: 'string-dateTime' },
  { label: '单选框', value: 'radio', uiKey: 'string-radio' },
  { label: '复选框', value: 'checkbox', uiKey: 'string-checkbox' },
  { label: '下拉单选', value: 'select', uiKey: 'string-select' },
  { label: '下拉多选', value: 'multiSelect', uiKey: 'string-multiSelect' },
  { label: '文件上传', value: 'upload', uiKey: 'string-upload' },
  { label: '是否选择', value: 'checkbox', uiKey: 'boolean-checkbox' },
  { label: '开关', value: 'switch', uiKey: 'boolean-switch' },
  { label: '日期范围', value: 'range', uiKey: 'array-range' },
  { label: '组', value: 'object', uiKey: 'object' },
  { label: '列表', value: 'array', uiKey: 'array' },
];

function filterStringUiType(format) {
  switch (format) {
    case 'date':
      return _.filter(UI_TYPE, (item) => ['日期选择'].includes(item.label));
    // case 'date-time':
    //   return _.filter(UI_TYPE, (item) => ['日期时间'].includes(item.label));
    default:
      return _.filter(UI_TYPE, (item) => ['输入框', '文本域', '日期选择', '单选框','复选框', '下拉单选','下拉多选', '图片展示', '文件上传'].includes(item.label));
  }
}

export function filterUiType(field, format) {
  switch (field) {
    case 'number':
    case 'integer':
      return _.filter(UI_TYPE, (item) => ['数字输入框', '滑动条'].includes(item.label));
    case 'string':
      return filterStringUiType(format);
    case 'array':
      return _.filter(UI_TYPE, (item) => ['列表'].includes(item.label));
    case 'boolean':
      return _.filter(UI_TYPE, (item) => ['是否选择', '开关'].includes(item.label));
    case 'object':
      return _.filter(UI_TYPE, (item) => ['组'].includes(item.label));
    default:
      return _.filter(UI_TYPE, (item) => ['输入框', '文本域', '日期选择', '单选框', '下拉单选', '图片展示', '文件上传'].includes(item.label));
  }
}

export function filterUiTypeDefaultValue(field, format) {
  return filterUiType(field) && filterUiType(field)[0] && filterUiType(field)[0] ? {
    uiKey: filterUiType(field, format)[0].uiKey,
    uiValue: filterUiType(field, format)[0].value,
    uiFormat: filterUiType(field, format)[0].format,
  } : {};
}

export function getUiObjByUiKey(uiKey) {
  return _.find(UI_TYPE, { uiKey });
}


export function defaultSchemaUi(field) {
  return field === 'array' ? {
    'ui:widget': filterUiTypeDefaultValue(field),
    type: field,
    items: {
      'ui:widget': filterUiTypeDefaultValue('string'),
      type: 'string'
    }
  } : { 'ui:widget': filterUiTypeDefaultValue(field), type: field }
}

export function getUiData(state, keys) {
  let curState = state;
  // for (let i = 0; i < keys.length; i++) {
  //   curState = curState ? curState[keys[i]] : {};
  // }
  return curState;
}

export function setUiData(state, keys, value, isDelete) {
  let curState = state;
  console.log(' keys, value, isDelete', keys, value, isDelete);
  if (keys.length === 0) {
    curState = Object.assign(isDelete ? {}: curState, value);
  } else {
    for (let i = 0; i < keys.length - 1; i++) {
      curState = curState ? curState[keys[i]] : {};
    }
    curState && (curState[keys[keys.length - 1]] = value);
  }
};

export function deleteUiData(state, keys) {
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
export function combineSchema(propsSchema = {}, uiSchema = {}) {
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

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}