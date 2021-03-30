import utils from '../utils';
import { configCache } from '../globalData';
const _ = require('underscore');

let fieldNum = 1;
export default {
  state: {
    message: null,
    data: {},
  },

  changeUiAction: function (state, action, oldState) {
    const prefix = action.prefix;
    const key = action.key;
    const value = action.value;
    const data = action.data;
    prefix.set(key, 'string');
    let keys = [];
    // let parentKeys = utils.getParentKeys(keys);
    // let oldData = oldState.data;
    // let parentData = utils.getUiData(oldData, parentKeys);
    // if (parentData['ui:widget'] === value) {
    //   return;
    // }

    // let newParentDataItem = utils.defaultSchemaUi(value);

    // let newParentData = Object.assign({}, keys[0] ? { [keys[0]]: newParentDataItem } : newParentDataItem);

    // let newKeys = [].concat('data', parentKeys);
    // utils.setUiData(state, newKeys, newParentData, data);
  },


  deleteItemUiAction: function (state, action, oldState) {
    const keys = action.key;

    let name = keys[keys.length - 1];
    let oldData = oldState.data;
    let parentKeys = utils.getParentKeys(keys);
    let parentData = utils.getData(oldData, parentKeys);
    let newParentData = {};
    for (let i in parentData) {
      if (i !== name) {
        newParentData[i] = parentData[i];
      }
    }

    utils.setData(state.data, parentKeys, newParentData);
  },

  addFieldUiAction: function (state, action, oldState) {
    const currentNodeName = configCache.getCache('newNodeName');
    const uiPrefixMap = utils.cloneObject(action.uiPrefixMap);
    uiPrefixMap.push({
      key: currentNodeName,
      type:'string'
    })
    let keys = uiPrefixMap.map(item => item.key);
    let newPropertiesData = utils.defaultSchemaUi('string');
    utils.setUiData(state.data, keys, newPropertiesData);
  },

  addChildFieldUiAction: function (state, action, oldState) {
    const currentNodeName = configCache.getCache('newNodeName');
    const uiPrefixMap = utils.cloneObject(action.uiPrefixMap);
    uiPrefixMap.push({
      key: currentNodeName,
      type:'string'
    })
    let keys = uiPrefixMap.map(item => item.key);
    let newPropertiesData = utils.defaultSchemaUi('string');
    utils.setUiData(state.data, keys, newPropertiesData);
  },
};
