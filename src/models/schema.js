import handleSchema from '../schema.js';
import { configCache } from '../globalData';
import {getParentKeys,getData,JSONPATH_JOIN_CHAR,setData,deleteData,defaultSchema,cloneObject,handleSchemaRequired } from '../utils';
const _ = require('lodash');

let fieldNum = 1;

export default {
  state: {
    message: null,
    data: {
      title: '',
      type: 'object',
      properties: {},
      required: []
    },
    open: {
      properties: true
    }
  },

  changeEditorSchemaAction: function(state, action) {
    handleSchema(action.value);
    state.data = action.value;
  },

  changeNameAction: function(state, action, oldState) {
    const keys = action.prefix;
    const name = action.name;
    const value = action.value;
    let oldData = oldState.data;
    let parentKeys = getParentKeys(keys);
    let parentData = getData(oldData, parentKeys);
    let requiredData = [].concat(parentData.required || []);
    let propertiesData = getData(oldData, keys);
    let newPropertiesData = {};

    let curData = propertiesData[name];
    let openKeys = [].concat(keys, value, 'properties').join(JSONPATH_JOIN_CHAR);
    let oldOpenKeys = [].concat(keys, name, 'properties').join(JSONPATH_JOIN_CHAR);
    if (curData.properties) {
      delete state.open[oldOpenKeys];
      state.open[openKeys] = true;
    }

    if (propertiesData[value] && typeof propertiesData[value] === 'object') {
      return;
    }

    requiredData = requiredData.map(item => {
      if (item === name) return value;
      return item;
    });

    parentKeys.push('required');
    setData(state.data, parentKeys, requiredData);

    for (let i in propertiesData) {
      if (i === name) {
        newPropertiesData[value] = propertiesData[i];
      } else newPropertiesData[i] = propertiesData[i];
    }

    setData(state.data, keys, newPropertiesData);
  },

  changeValueAction: function(state, action) {
    const keys = action.key;
    if (action.value) {
      setData(state.data, keys, action.value);
    } else {
      deleteData(state.data, keys);
    }
  },

  changeTypeAction: function(state, action, oldState) {
    const keys = action.key;
    const value = action.value;
    let parentKeys = getParentKeys(keys);
    let oldData = oldState.data;
    let parentData = getData(oldData, parentKeys);
    if (parentData.type === value) {
      return;
    }
    // let newParentData = defaultSchema[value];
    let newParentDataItem = defaultSchema[value];

    // 将备注过滤出来
    let parentDataItem = parentData.description ? { description: parentData.description } : {};
    let newParentData = Object.assign({}, newParentDataItem, parentDataItem);

    let newKeys = [].concat('data', parentKeys);
    setData(state, newKeys, newParentData);
  },

  enableRequireAction: function(state, action, oldState) {
    const keys = action.prefix;
    let parentKeys = getParentKeys(keys);
    let oldData = oldState.data;
    let parentData = getData(oldData, parentKeys);
    let requiredData = [].concat(parentData.required || []);
    let index = requiredData.indexOf(action.name);

    if (!action.required && index >= 0) {
      requiredData.splice(index, 1);
      parentKeys.push('required');
      if (requiredData.length === 0) {
        deleteData(state.data, parentKeys);
      } else {
        setData(state.data, parentKeys, requiredData);
      }
    } else if (action.required && index === -1) {
      requiredData.push(action.name);
      parentKeys.push('required');
      setData(state.data, parentKeys, requiredData);
    }
  },

  requireAllAction: function(state, action, oldState) {
    // let oldData = oldState.data;
    let data = cloneObject(action.value);
    handleSchemaRequired(data, action.required);

    state.data = data;
  },

  deleteItemAction: function(state, action, oldState) {
    const keys = action.key;

    let name = keys[keys.length - 1];
    let oldData = oldState.data;
    let parentKeys = getParentKeys(keys);
    let parentData = getData(oldData, parentKeys);
    let newParentData = {};
    for (let i in parentData) {
      if (i !== name) {
        newParentData[i] = parentData[i];
      }
    }

    setData(state.data, parentKeys, newParentData);
  },

  addFieldAction: function(state, action, oldState) {
    const keys = action.prefix;
    let oldData = oldState.data;
    let name = action.name;
    let propertiesData = getData(oldData, keys);
    let newPropertiesData = {};

    let parentKeys = getParentKeys(keys);
    let parentData = getData(oldData, parentKeys);
    let requiredData = [].concat(parentData.required || []);

    let ranName = '';
    if (!name) {
      newPropertiesData = Object.assign({}, propertiesData);
      ranName = 'field_' + fieldNum++;
      newPropertiesData[ranName] = defaultSchema.string;
      requiredData.push(ranName);
    } else {
      for (let i in propertiesData) {
        newPropertiesData[i] = propertiesData[i];
        if (i === name) {
          ranName = 'field_' + fieldNum++;
          newPropertiesData[ranName] = defaultSchema.string;
          requiredData.push(ranName);
        }
      }
    }
    configCache.setCache('newNodeName', ranName);
    setData(state.data, keys, newPropertiesData);
    // add required
    parentKeys.push('required');
    setData(state.data, parentKeys, requiredData);
  },
  addChildFieldAction: function(state, action, oldState) {
    const keys = action.key;
    let oldData = oldState.data;
    let propertiesData = getData(oldData, keys);
    let newPropertiesData = {};

    newPropertiesData = Object.assign({}, propertiesData);
    let ranName = 'field_' + fieldNum++;
    newPropertiesData[ranName] = defaultSchema.string;
    configCache.setCache('newNodeName', ranName);
    setData(state.data, keys, newPropertiesData);

    // add required
    let parentKeys = getParentKeys(keys);
    let parentData = getData(oldData, parentKeys);
    let requiredData = [].concat(parentData.required || []);
    requiredData.push(ranName);
    parentKeys.push('required');
    setData(state.data, parentKeys, requiredData);
  },

  setOpenValueAction: function(state, action, oldState) {
    const keys = action.key.join(JSONPATH_JOIN_CHAR);

    let status;
    if (_.isUndefined(action.value)) {
      status = getData(oldState.open, [keys]) ? false : true;
    } else {
      status = action.value;
    }
    setData(state.open, [keys], status);
  }
};
