import _ from 'lodash';
import { configCache } from '../globalData';
import { setUiData, getParentKeys, getData, cloneObject,deleteUiData,filterUiTypeDefaultValue } from '../utils';

export default {
  state: {
    message: null,
    data: {},
  },

  changeEditorUiSchemaAction: function (state, action) {
    const value = action.value;
    if (_.get(value, 'type') === 'string') {
      const format = _.get(value, 'format')
      const { uiKey,uiFormat } = filterUiTypeDefaultValue('string', format);
      const newUiData = { type: 'string', uiKey, format:uiFormat }
      state.data = newUiData;
    }
  },

  changeUiValueAction: function(state, action) {
    const keys = action.key;
    if (action.value) {
      setUiData(state.data, keys, action.value);
    } else {
      deleteUiData(state.data, keys);
    }
  },

  changeUiAction: function (state, action) {
    const prefix = action.prefix;
    const uiKey = action.uiKey;
    const value = action.value;
    const dataType = action.type;
    let newKeys = prefix.map(item => item.key);
    let uiWidget = { type: dataType, uiKey: uiKey };
    switch (value) {
      case 'textarea':
      case 'date':
        uiWidget['format'] = value;
        break;
      case 'range':
        uiWidget['type'] = value;
        uiWidget['format'] = 'dateTime';
        break;
      case 'number':
        uiWidget['type'] = value;
        break;
      case 'object':
      case 'input':
        break;
      case 'array':
        uiWidget['items'] = {
          type: "string",
          uiKey: 'string-input'
        }
        break;
      default:
        uiWidget['ui:widget'] = value;
        break;
    }
    let newDataItem = uiWidget;
    setUiData(state.data, newKeys, newDataItem);
  },


  deleteItemUiAction: function (state, action, oldState) {
    const prefix = action.prefix;
    const keys = prefix.map(item => item.key);
    let name = keys[keys.length - 1];
    let parentKeys = getParentKeys(keys);
    let oldData = oldState.data;
    let parentData = getData(oldData, parentKeys);
    let newParentData = {};
    for (let i in parentData) {
      if (i !== name) {
        newParentData[i] = parentData[i];
      }
    }
    setUiData(state.data, parentKeys, newParentData, true);
  },

  addFieldUiAction: function (state, action) {
    const currentNodeName = configCache.getCache('newNodeName');
    const uiPrefixMap = cloneObject(action.uiPrefixMap);
    uiPrefixMap.push({
      key: currentNodeName,
      type: 'string'
    })
    let keys = uiPrefixMap.map(item => item.key);
    let uiWidget = { type: 'string', uiKey: 'string-input' };
    setUiData(state.data, keys, uiWidget);
  },

  addChildFieldUiAction: function (state, action) {
    const currentNodeName = configCache.getCache('newNodeName');
    const uiPrefixMap = cloneObject(action.uiPrefixMap);
    uiPrefixMap.push({
      key: currentNodeName,
      type: 'string'
    })
    let keys = uiPrefixMap.map(item => item.key);
    let uiWidget = { type: 'string', uiKey: 'string-input' };
    setUiData(state.data, keys, uiWidget);
  },
};
