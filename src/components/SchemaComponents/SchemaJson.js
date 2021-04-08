import React, { Component, PureComponent } from 'react';

import {
  CaretDownOutlined,
  CaretRightOutlined,
  CloseOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';

import {
  Dropdown,
  Menu,
  Row,
  Col,
  Select,
  Checkbox,
  Input,
  message,
  Tooltip,
} from 'antd';
import FieldInput from './FieldInput'
import './schemaJson.css';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import LocaleProvider from '../LocalProvider/index.js';
import MockSelect from '../MockSelect/index.js';
import {cloneObject,filterUiTypeDefaultValue,JSONPATH_JOIN_CHAR,SCHEMA_TYPE,filterUiType,getUiObjByUiKey } from '../../utils';

const Option = Select.Option;

const mapping = (name, data, showEdit, showAdv, uiSchema, uiPrefixMap) => {
  let newUiPrefixMap = cloneObject(uiPrefixMap);
  if (Array.isArray(name) && name.length > 1 && Array.isArray(newUiPrefixMap)) {
    let key = name[name.length - 1];
    newUiPrefixMap.push({
      key,
      type: data.type
    })
  }
  switch (data.type) {
    case 'array':
      newUiPrefixMap.push({
        key: 'items',
        type:'string'
      })
      return <SchemaArray prefix={name} data={data} showEdit={showEdit} showAdv={showAdv} uiSchema={uiSchema} uiPrefixMap={newUiPrefixMap} />;
    case 'object':
      let nameArray = [].concat(name, 'properties');
      return <SchemaObject prefix={nameArray} data={data} showEdit={showEdit} showAdv={showAdv} uiSchema={uiSchema} uiPrefixMap={newUiPrefixMap} />;
    default:
      return null;
  }
};

class SchemaArray extends PureComponent {
  constructor(props, context) {
    super(props);
    this._tagPaddingLeftStyle = {};
    this.Model = context.Model.schema;
    this.UiModel = context.Model.uiSchema;
  }

  componentWillMount() {
    const { prefix } = this.props;
    let length = prefix.filter(name => name !== 'properties').length;
    this.__tagPaddingLeftStyle = {
      paddingLeft: `${20 * (length + 1)}px`
    };
  }

  getPrefix() {
    return [].concat(this.props.prefix, 'items');
  }

  // 修改数据类型
  handleChangeType = value => {
    let prefix = this.getPrefix();
    let key = [].concat(prefix, 'type');
    this.Model.changeTypeAction({ key, value });
    
    // 修改ui
    let uiPrefix = this.getUiPrefix();
    const {uiKey, uiValue} = filterUiTypeDefaultValue(value);
    this.UiModel.changeUiAction({ prefix: uiPrefix, uiKey, value: uiValue, type: value });
  };

  // 修改备注信息
  handleChangeDesc = e => {
    let prefix = this.getPrefix();
    let key = [].concat(prefix, `description`);
    let value = e.target.value;
    this.Model.changeValueAction({ key, value });
  };

  // 修改mock信息
  handleChangeMock = e => {
    let prefix = this.getPrefix();
    let key = [].concat(prefix, `mock`);
    let value = e ? { mock: e } : '';
    this.Model.changeValueAction({ key, value });
  };

  handleChangeTitle = e => {
    let prefix = this.getPrefix();
    let key = [].concat(prefix, `title`);
    let value = e.target.value;
    this.Model.changeValueAction({ key, value });
  }

  // 增加子节点
  handleAddChildField = () => {
    let prefix = this.getPrefix();
    let keyArr = [].concat(prefix, 'properties');
    this.Model.addChildFieldAction({ key: keyArr });
    this.Model.setOpenValueAction({ key: keyArr, value: true });
  };

  handleClickIcon = () => {
    let prefix = this.getPrefix();
    // 数据存储在 properties.name.properties下
    let keyArr = [].concat(prefix, 'properties');
    this.Model.setOpenValueAction({ key: keyArr });
  };

  handleShowEdit = (name, type) => {
    let prefix = this.getPrefix();
    this.props.showEdit(prefix, name, this.props.data.items[name], type);
  };

  handleShowAdv = () => {
    this.props.showAdv(this.getPrefix(), this.props.data.items);
  };

  // 修改展示UI
  handleChangeUiWidget = value => {
    let prefix = this.getUiPrefix();
    const {uiKey, uiValue} = filterUiTypeDefaultValue(value);
    this.UiModel.changeUiAction({ prefix: prefix, key: 'items', uiKey, value: uiValue, type: this.props.data.type });
  }

  // 修改分组
  handleChangeGroup = (e) => {
    let prefix = this.getPrefix();
    let key = [].concat(prefix, `group`);
    let value = e.target.value;
    this.Model.changeValueAction({ key, value });
  }

  getUiPrefix() {
    return this.props.uiPrefixMap;
  }

  render() {
    const { data, prefix, showEdit, showAdv, uiSchema, uiPrefixMap } = this.props;
    const items = data.items;
    let prefixArray = [].concat(prefix, 'items');

    let prefixArrayStr = [].concat(prefixArray, 'properties').join(JSONPATH_JOIN_CHAR);
    let showIcon = this.context.getOpenValue([prefixArrayStr]);
    let uiSelect = '';
    let childUiSchema =cloneObject(uiSchema);
    uiPrefixMap.forEach((item, index) => {
      childUiSchema = childUiSchema[item.key];
      if (index === uiPrefixMap.length - 1) {
        uiSelect =  childUiSchema && childUiSchema['uiKey'];
      }
    });
    return !_.isUndefined(data.items) && (
      <div className="array-type">
        <Row className="array-item-type" type="flex" justify="space-around" align="middle">
          <Col
            span={8}
            className="col-item name-item col-item-name"
            style={this.__tagPaddingLeftStyle}
          >
            <Row type="flex" justify="space-around" align="middle">
              <Col span={2} className="down-style-col">
                {items.type === 'object' ? (
                  <span className="down-style" onClick={this.handleClickIcon}>
                    {showIcon ? (
                      <CaretDownOutlined className="icon-object" />
                    ) : (
                      <CaretRightOutlined className="icon-object" />
                    )}
                  </span>
                ) : null}
              </Col>
              <Col span={22}>
                <Input addonAfter={<Checkbox disabled />} disabled value="Items" />
              </Col>
            </Row>
          </Col>
          <Col span={this.props.showGroup ? 2 : 3} className="col-item col-item-type">
            <Select
              name="itemtype"
              className="type-select-style"
              onChange={this.handleChangeType}
              value={items.type}
            >
              {SCHEMA_TYPE.map((item, index) => {
                return (
                  <Option value={item} key={index}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </Col>
          {this.context.isMock && (
            <Col span={this.props.showUiSelect ? 2 : 3} className="col-item col-item-mock">
              <MockSelect
                schema={items}
                showEdit={() => this.handleShowEdit('mock', items.type)}
                onChange={this.handleChangeMock}
              />
            </Col>
          )}
          <Col span={this.props.isMock ? this.props.showGroup ? 3 : 4 : this.props.showGroup ? 4 : 5} className="col-item col-item-mock">
            <Input
              addonAfter={<EditOutlined onClick={() => this.handleShowEdit('title')} />}
              placeholder={LocaleProvider('title')}
              value={items.title}
              onChange={this.handleChangeTitle}
            />
          </Col>
          <Col span={this.props.isMock ? this.props.showUiSelect ? 3 : 4 : this.props.showUiSelect ? 4 : 5} className="col-item col-item-desc">
            <Input
              addonAfter={<EditOutlined onClick={() => this.handleShowEdit('description')} />}
              placeholder={LocaleProvider('description')}
              value={items.description}
              onChange={this.handleChangeDesc}
            />
          </Col>

          {this.props.showGroup && <Col span={2} className="col-item col-item-group">
            <Input
              placeholder={LocaleProvider('group')}
              value={items.group}
              onChange={this.handleChangeGroup}
            />
          </Col>
          }
          {this.props.showUiSelect && <Col span={2} className="col-item col-item-ui">
            <Select
              className="type-select-style"
              onChange={this.handleChangeUiWidget}
              value={uiSelect}
            >
              {filterUiType(items.type, items.format).map((item, index) => {
                return (
                  <Option value={item.uiKey} key={index}>
                    {item.label}
                  </Option>
                );
              })}
            </Select>
          </Col>
          }


          <Col span={2} className="col-item col-item-setting">
            <span className="adv-set" onClick={this.handleShowAdv}>
              <Tooltip placement="top" title={LocaleProvider('adv_setting')}>
                <SettingOutlined />
              </Tooltip>
            </span>

            {items.type === 'object' ? (
              <span onClick={this.handleAddChildField}>
                <Tooltip placement="top" title={LocaleProvider('add_child_node')}>
                  <PlusOutlined className="plus" />
                </Tooltip>
              </span>
            ) : null}
          </Col>
        </Row>
        <div className="option-formStyle">{mapping(prefixArray, items, showEdit, showAdv, uiSchema, uiPrefixMap)}</div>
      </div>
    );
  }
}

SchemaArray.contextTypes = {
  getOpenValue: PropTypes.func,
  Model: PropTypes.object,
  UiModel: PropTypes.object,
  isMock: PropTypes.bool
};

class SchemaItem extends PureComponent {
  constructor(props, context) {
    super(props);
    this._tagPaddingLeftStyle = {};
    // this.num = 0
    this.Model = context.Model.schema;
    this.UiModel = context.Model.uiSchema;
  }
  componentWillMount() {
    const { prefix } = this.props;
    let length = prefix.filter(name => name !== 'properties').length;
    this.__tagPaddingLeftStyle = {
      paddingLeft: `${20 * (length + 1)}px`
    };
  }

  getPrefix() {
    return [].concat(this.props.prefix, this.props.name);
  }

  // 修改节点字段名
  handleChangeName = e => {
    const { data, prefix, name } = this.props;
    let value = e.target.value;

    if (data.properties[value] && typeof data.properties[value] === 'object') {
      return message.error(`The field "${value}" already exists.`);
    }

    this.Model.changeNameAction({ value, prefix, name });
  };

  // 修改备注信息
  handleChangeDesc = e => {
    let prefix = this.getPrefix();
    let key = [].concat(prefix, 'description');
    let value = e.target.value;
    this.Model.changeValueAction({ key, value });
  };

  // 修改mock 信息
  handleChangeMock = e => {
    let prefix = this.getPrefix();
    let key = [].concat(prefix, `mock`);
    let value = e ? { mock: e } : '';
    this.Model.changeValueAction({ key, value });
  };

  handleChangeTitle = e => {
    let prefix = this.getPrefix();
    let key = [].concat(prefix, `title`);
    let value = e.target.value;
    this.Model.changeValueAction({ key, value });
  }

  // 修改数据类型
  handleChangeType = value => {
    let prefix = this.getPrefix();
    let key = [].concat(prefix, 'type');
    this.Model.changeTypeAction({ key, value: value });
    
    // 修改ui
    let uiPrefix = this.getUiPrefix();
    const {uiKey, uiValue} = filterUiTypeDefaultValue(value);
    this.UiModel.changeUiAction({ prefix: uiPrefix, uiKey, value: uiValue, type: value });
  };

  // 删除节点
  handleDeleteItem = () => {
    const { prefix, name } = this.props;
    let nameArray = this.getPrefix();
    this.Model.deleteItemAction({ key: nameArray });
    this.Model.enableRequireAction({ prefix, name, required: false });

     // 删除ui
     let uiPrefix = this.getUiPrefix();
     this.UiModel.deleteItemUiAction({ prefix: uiPrefix });
  };
  /*
  展示备注编辑弹窗
  editorName: 弹窗名称 ['description', 'mock']
  type: 如果当前字段是object || array showEdit 不可用
  */
  handleShowEdit = (editorName, type) => {
    const { data, name, showEdit } = this.props;

    showEdit(this.getPrefix(), editorName, data.properties[name][editorName], type);
  };

  // 展示高级设置弹窗
  handleShowAdv = () => {
    const { data, name, showAdv } = this.props;
    showAdv(this.getPrefix(), data.properties[name]);
  };

  //  增加子节点
  handleAddField = () => {
    const { prefix, name, uiPrefixMap } = this.props;
    this.Model.addFieldAction({ prefix, name });
    this.UiModel.addFieldUiAction({ uiPrefixMap, name })
  };

  // 控制三角形按钮
  handleClickIcon = () => {
    let prefix = this.getPrefix();
    // 数据存储在 properties.xxx.properties 下
    let keyArr = [].concat(prefix, 'properties');
    this.Model.setOpenValueAction({ key: keyArr });
  };

  // 修改是否必须
  handleEnableRequire = e => {
    const { prefix, name } = this.props;
    let required = e.target.checked;
    // this.enableRequire(this.props.prefix, this.props.name, e.target.checked);
    this.Model.enableRequireAction({ prefix, name, required });
  };

  // 修改展示UI
  handleChangeUiWidget = (value,type) => {
    let prefix = this.getUiPrefix();
    const uiObj = getUiObjByUiKey(value);
    this.UiModel.changeUiAction({ prefix: prefix,uiKey: value, value:_.get(uiObj,'value'), type:type });
  }

  // 修改分组
  handleChangeGroup = (e) => {
    let prefix = this.getPrefix();
    let key = [].concat(prefix, `group`);
    let value = e.target.value;
    this.Model.changeValueAction({ key, value });
  }

  getUiPrefix() {
    const { name, data } = this.props;
    return [].concat(this.props.uiPrefixMap, { key: name, type: data.type });
  }

  render() {
    let { name, data, prefix, showEdit, showAdv, uiSchema, uiPrefixMap } = this.props;
    let value = data.properties[name];
    let prefixArray = [].concat(prefix, name);
    let uiPrefixMapArray = [].concat(uiPrefixMap, [{ key: name, type: 'string' }]);
    let prefixStr = prefix.join(JSONPATH_JOIN_CHAR);
    let prefixArrayStr = [].concat(prefixArray, 'properties').join(JSONPATH_JOIN_CHAR);
    let show = this.context.getOpenValue([prefixStr]);
    let showIcon = this.context.getOpenValue([prefixArrayStr]);
    let childUiSchema =cloneObject(uiSchema);
    let uiSelect = '';
    uiPrefixMapArray.forEach((item, index) => {
      childUiSchema = _.get(childUiSchema,item.key) ;
      if (index === uiPrefixMapArray.length - 1) {
        uiSelect = _.get(childUiSchema,'uiKey')
      }
    });

    return show ? (
      <div>
        <Row type="flex" justify="space-around" align="middle">
          <Col
            span={8}
            className="col-item name-item col-item-name"
            style={this.__tagPaddingLeftStyle}
          >
            <Row type="flex" justify="space-around" align="middle">
              <Col span={2} className="down-style-col">
                {value.type === 'object' ? (
                  <span className="down-style" onClick={this.handleClickIcon}>
                    {showIcon ? (
                      <CaretDownOutlined className="icon-object" />
                    ) : (
                      <CaretRightOutlined className="icon-object" />
                    )}
                  </span>
                ) : null}
              </Col>
              <Col span={22}>
                <FieldInput
                  addonAfter={
                    <Tooltip placement="top" title={LocaleProvider('required')}>
                      <Checkbox
                        onChange={this.handleEnableRequire}
                        checked={
                          _.isUndefined(data.required) ? false : data.required.indexOf(name) !== -1
                        }
                      />
                    </Tooltip>
                  }
                  onChange={this.handleChangeName}
                  value={name}
                />
              </Col>
            </Row>
          </Col>


          <Col span={this.props.showGroup ? 2 : 3} className="col-item col-item-type">
            <Select
              className="type-select-style"
              onChange={this.handleChangeType}
              value={value.type}
            >
              {SCHEMA_TYPE.map((item, index) => {
                return (
                  <Option value={item} key={index}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </Col>


          {this.context.isMock && (
            <Col span={this.props.showUiSelect ? 2 : 3} className="col-item col-item-mock">
              {/* <Input
                addonAfter={
                  <Icon type="edit" onClick={() => this.handleShowEdit('mock', value.type)} />
                }
                placeholder={LocaleProvider('mock')}
                value={value.mock ? value.mock.mock : ''}
                onChange={this.handleChangeMock}
                disabled={value.type === 'object' || value.type === 'array'}
              /> */}
              <MockSelect
                schema={value}
                showEdit={() => this.handleShowEdit('mock', value.type)}
                onChange={this.handleChangeMock}
              />
            </Col>
          )}

          <Col span={this.props.isMock ? this.props.showGroup ? 3 : 4 : this.props.showGroup ? 4 : 5} className="col-item col-item-mock">
            <Input
              addonAfter={<EditOutlined onClick={() => this.handleShowEdit('title')} />}
              placeholder={LocaleProvider('title')}
              value={value.title}
              onChange={this.handleChangeTitle}
            />
          </Col>

          <Col span={this.props.isMock ? this.props.showUiSelect ? 3 : 4 : this.props.showUiSelect ? 4 : 5} className="col-item col-item-desc">
            <Input
              addonAfter={<EditOutlined onClick={() => this.handleShowEdit('description')} />}
              placeholder={LocaleProvider('description')}
              value={value.description}
              onChange={this.handleChangeDesc}
            />
          </Col>


          <Col span={2} className="col-item col-item-group">
            <Input
              placeholder={LocaleProvider('group')}
              value={value.group}
              onChange={this.handleChangeGroup}
            />
          </Col>
          <Col span={2} className="col-item col-item-ui">
            <Select
              className="type-select-style"
              onChange={(sValue)=>this.handleChangeUiWidget(sValue, value.type)}
              value={uiSelect}

            >
              {filterUiType(value.type, value.format).map((item, index) => {
                return (
                  <Option value={item.uiKey} key={index}>
                    {item.label}
                  </Option>
                );
              })}
            </Select>
          </Col>

          <Col span={2} className="col-item col-item-setting">
            <span className="adv-set" onClick={this.handleShowAdv}>
              <Tooltip placement="top" title={LocaleProvider('adv_setting')}>
                <SettingOutlined />
              </Tooltip>
            </span>
            <span className="delete-item" onClick={this.handleDeleteItem}>
              <CloseOutlined className="close" />
            </span>
            {value.type === 'object' ? (
              <DropPlus prefix={prefix} name={name} uiPrefixMap={uiPrefixMap} />
            ) : (
              <span onClick={this.handleAddField}>
                <Tooltip placement="top" title={LocaleProvider('add_sibling_node')}>
                  <PlusOutlined className="plus" />
                </Tooltip>
              </span>
            )}
          </Col>
        </Row>
        <div className="option-formStyle">{mapping(prefixArray, value, showEdit, showAdv, uiSchema, uiPrefixMap)}</div>
      </div>
    ) : null;
  }
}

SchemaItem.contextTypes = {
  getOpenValue: PropTypes.func,
  Model: PropTypes.object,
  UiModel: PropTypes.object,
  isMock: PropTypes.bool
};

class SchemaObjectComponent extends Component {
  shouldComponentUpdate(nextProps) {
    if (
      _.isEqual(nextProps.data, this.props.data) &&
      _.isEqual(nextProps.prefix, this.props.prefix) &&
      _.isEqual(nextProps.open, this.props.open) &&
      _.isEqual(nextProps.uiSchema, this.props.uiSchema) &&
      _.isEqual(nextProps.uiPrefixMap, this.props.uiPrefixMap)
    ) {
      return false;
    }
    return true;
  }

  render() {
    const { data, prefix, showEdit, showAdv, uiSchema, uiPrefixMap } = this.props;
    return (
      <div className="object-style">
        {Object.keys(data.properties).map((name, index) => (
          <SchemaItem
            key={index}
            data={this.props.data}
            name={name}
            prefix={prefix}
            showEdit={showEdit}
            showAdv={showAdv}
            uiSchema={uiSchema}
            uiPrefixMap={uiPrefixMap}
          />
        ))}
      </div>
    );
  }
}

const SchemaObject = connect(state => ({
  open: state.schema.open
}))(SchemaObjectComponent);

const DropPlus = (props, context) => {
  const { prefix, name,  uiPrefixMap } = props;
  const Model = context.Model.schema;
  const UiModel = context.Model.uiSchema;
  const menu = (
    <Menu>
      <Menu.Item>
        <span onClick={() => {
          Model.addFieldAction({ prefix, name })
          UiModel.addFieldUiAction({ uiPrefixMap: uiPrefixMap });
        }}>
          {LocaleProvider('sibling_node')}
        </span>
      </Menu.Item>
      <Menu.Item>
        <span
          onClick={() => {
            Model.setOpenValueAction({ key: [].concat(prefix, name, 'properties'), value: true });
            Model.addChildFieldAction({ key: [].concat(prefix, name, 'properties') });
            UiModel.addChildFieldUiAction({ uiPrefixMap: [...uiPrefixMap, { key: name, type: 'string' }] });
          }}
        >
          {LocaleProvider('child_node')}
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Tooltip placement="top" title={LocaleProvider('add_node')}>
      <Dropdown overlay={menu}>
        <PlusOutlined className="plus" />
      </Dropdown>
    </Tooltip>
  );
};

DropPlus.contextTypes = {
  Model: PropTypes.object,
  UiModel: PropTypes.object
};

const SchemaJson = props => {
  const uiPrefixMap = [];
  const item = mapping([], props.data, props.showEdit, props.showAdv, props.uiSchema, uiPrefixMap);
  return <div className="schema-content">{item}</div>;
};

export default SchemaJson;
