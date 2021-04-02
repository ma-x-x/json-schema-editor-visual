import { configCache } from '../globalData';
import _ from 'lodash';
import { setUiData,getParentKeys,getData,cloneObject,defaultSchemaUi} from '../utils';

export default {
  state: {
    message: null,
    data: {},
  },

  changeUiAction: function (state, action) {
    const prefix = action.prefix;
    const uiWidgetObj = action.uiWidgetObj;
    const value = action.value;
    const dataType = action.type;
    let newKeys = prefix.map(item => item.key);
    let newDataItem = _.isEmpty(uiWidgetObj) ? { "ui:widget": value, type: dataType } : uiWidgetObj;
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
    setUiData(state.data, parentKeys, newParentData);
  },

  addFieldUiAction: function (state, action) {
    const currentNodeName = configCache.getCache('newNodeName');
    const uiPrefixMap = cloneObject(action.uiPrefixMap);
    uiPrefixMap.push({
      key: currentNodeName,
      type: 'string'
    })
    let keys = uiPrefixMap.map(item => item.key);
    let newPropertiesData = defaultSchemaUi('string');
    setUiData(state.data, keys, newPropertiesData);
  },

  addChildFieldUiAction: function (state, action) {
    const currentNodeName = configCache.getCache('newNodeName');
    const uiPrefixMap = cloneObject(action.uiPrefixMap);
    uiPrefixMap.push({
      key: currentNodeName,
      type: 'string'
    })
    let keys = uiPrefixMap.map(item => item.key);
    let newPropertiesData = defaultSchemaUi('string');
    setUiData(state.data, keys, newPropertiesData);
  },
};
