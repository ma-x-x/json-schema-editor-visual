import React from 'react';
import _ from 'lodash';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';
import {
  Input,
  Row,
  Tooltip,
  Col,
  Select,
  Checkbox,
  Button,
  Modal,
  message,
  Tabs,
} from 'antd';
import './index.css';
import AceEditor from './components/AceEditor/AceEditor.js';
import { connect } from 'react-redux';
import SchemaJson from './components/SchemaComponents/SchemaJson.js';
import PropTypes from 'prop-types';
import handleSchema from './schema';
import CustomItem from './components/SchemaComponents/SchemaOther.js';
import LocalProvider from './components/LocalProvider/index.js';
import MockSelect from './components/MockSelect/index.js';
import LocaleProvider from './components/LocalProvider/index.js';
import SchemaRenderForm from './SchemaRenderForm'
import { debounce, getData, filterUiTypeDefaultValue, getUiObjByUiKey, SCHEMA_TYPE, filterUiType, expandUiType } from './utils';
const GenerateSchema = require('generate-schema/src/schemas/json.js');

const Option = Select.Option;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;
class jsonSchema extends React.Component {
  constructor(props) {
    super(props);
    this.alterMsg = debounce(this.alterMsg, 2000);
    const customWidgets = props.customWidgets;
    expandUiType(customWidgets);
    this.state = {
      visible: false,
      show: true,
      editVisible: false,
      description: '',
      descriptionKey: null,
      advVisible: false,
      itemKey: [],
      curItemCustomValue: null,
      checked: false,
      editorModalName: '', // 弹窗名称desctiption | mock
      mock: '',
      previewVisible: false,
      uiItemKey: [],
    };
    this.Model = this.props.Model.schema;
    this.UiModel = this.props.Model.uiSchema;
    this.jsonSchemaData = null;
    this.jsonData = null;
  }

  // json 导入弹窗
  showModal = () => {
    this.setState({
      visible: true
    });
  };
  handleOk = () => {
    if (this.importJsonType !== 'schema') {
      if (!this.jsonData) {
        return message.error('json 数据格式有误');
      }

      let jsonData = GenerateSchema(this.jsonData);
      this.Model.changeEditorSchemaAction({ value: jsonData });
    } else {
      if (!this.jsonSchemaData) {
        return message.error('json 数据格式有误');
      }
      this.Model.changeEditorSchemaAction({ value: this.jsonSchemaData });
    }
    this.setState({ visible: false });
  };
  handleCancel = () => {
    this.setState({ visible: false });
  };

  /** 预览弹窗 */
  showPreviewModal = () => {
    this.setState({
      previewVisible: true
    });
  };

  cancelPreviewModal = () => {
    this.setState({
      previewVisible: false
    });
  };


  componentWillReceiveProps(nextProps) {
    if (typeof this.props.onChange === 'function' && (this.props.schema !== nextProps.schema || this.props.uiSchema !== nextProps.uiSchema)) {
      let oldData = JSON.stringify(this.props.schema || '');
      let newData = JSON.stringify(nextProps.schema || '');
      let oldUiData = JSON.stringify(this.props.uiSchema || '');
      let newUiData = JSON.stringify(nextProps.uiSchema || '');
      if (oldData !== newData || oldUiData !== newUiData) return this.props.onChange(newData, newUiData);
    }
    if (this.props.data && this.props.data !== nextProps.data) {
      this.Model.changeEditorSchemaAction({ value: JSON.parse(nextProps.data) });
    }

    if (this.props.uiData && this.props.uiData !== nextProps.uiData) {
      this.UiModel.changeEditorUiSchemaAction({ value: JSON.parse(nextProps.uiData), isInit: true });
    }
  }

  componentWillMount() {
    let data = this.props.data;
    if (!data) {
      data = `{
        "type": "object",
        "title": "",
        "properties":{}
      }`;
    }
    this.Model.changeEditorSchemaAction({ value: JSON.parse(data) });
    let uiData = this.props.uiData;
    if (!uiData) {
      uiData = `{}`;
    }
    this.UiModel.changeEditorUiSchemaAction({ value: JSON.parse(uiData), isInit: true });
  }

  getChildContext() {
    return {
      getOpenValue: keys => {
        return getData(this.props.open, keys);
      },
      changeCustomValue: this.changeCustomValue,
      Model: this.props.Model,
      UiModel: this.props.UiModel,
      isMock: this.props.isMock,
      showGroup: this.props.showGroup,
      showUiSelect: this.props.showUiSelect,
    };
  }

  alterMsg = () => {
    // return message.error(LocalProvider('valid_json'));
  };

  // AceEditor 中的数据
  handleParams = e => {
    if (!e.text) return;
    // 将数据map 到store中
    if (e.format !== true) {
      return this.alterMsg();
    }
    handleSchema(e.jsonData);
    this.Model.changeEditorSchemaAction({
      value: e.jsonData
    });
  };

  // 修改数据类型
  changeType = (key, value) => {
    this.Model.changeTypeAction({ key: [key], value });
    const { uiKey, uiValue } = filterUiTypeDefaultValue(value);
    this.UiModel.changeUiAction({ prefix: [], uiKey, value: uiValue, type: value });
  };

  handleImportJson = e => {
    if (!e.text || e.format !== true) {
      return (this.jsonData = null);
    }
    this.jsonData = e.jsonData;
  };

  handleImportJsonSchema = e => {
    if (!e.text || e.format !== true) {
      return (this.jsonSchemaData = null);
    }
    this.jsonSchemaData = e.jsonData;
  };
  // 增加子节点
  addChildField = key => {
    this.Model.addChildFieldAction({ key: [key] });
    this.UiModel.addChildFieldUiAction({ uiPrefixMap: [] });
    this.setState({ show: true });
  };

  clickIcon = () => {
    this.setState({ show: !this.state.show });
  };

  // 修改备注信息
  changeValue = (key, value) => {
    if (key[0] === 'mock') {
      value = value ? { mock: value } : '';
    }
    this.Model.changeValueAction({ key, value });
  };

  // 修改uiSchema
  changeUiWidget = (key, value) => {
    const uiObj = getUiObjByUiKey(value);
    this.UiModel.changeUiAction({
      prefix: [], type: this.props.schema.type, uiKey: value, value: _.get(uiObj, 'value')
    });
  }

  // 备注/mock弹窗 点击ok 时
  handleEditOk = name => {
    this.setState({
      editVisible: false
    });
    let value = this.state[name];
    if (name === 'mock') {
      value = value ? { mock: value } : '';
    }
    this.Model.changeValueAction({ key: this.state.descriptionKey, value });
  };

  handleEditCancel = () => {
    this.setState({
      editVisible: false
    });
  };
  /*
    展示弹窗modal
    prefix: 节点前缀信息
    name: 弹窗的名称 ['description', 'mock']
    value: 输入值
    type: 如果当前字段是object || array showEdit 不可用
  */
  showEdit = (prefix, name, value, type) => {
    if (type === 'object' || type === 'array') {
      return;
    }
    let descriptionKey = [].concat(prefix, name);

    value = name === 'mock' ? (value ? value.mock : '') : value;
    this.setState({
      editVisible: true,
      [name]: value,
      descriptionKey,
      editorModalName: name
    });
  };

  // 修改备注/mock参数信息
  changeDesc = (e, name) => {
    this.setState({
      [name]: e
    });
  };

  // 高级设置
  handleAdvOk = () => {
    if (this.state.itemKey.length === 0) {
      this.Model.changeEditorSchemaAction({
        value: this.state.curItemCustomValue
      });
      this.UiModel.changeEditorUiSchemaAction({
        value: this.state.curItemCustomValue
      });
    } else {
      this.Model.changeValueAction({
        key: this.state.itemKey,
        value: this.state.curItemCustomValue
      });
      this.UiModel.changeUiValueAction({
        key: this.state.uiItemKey,
        value: this.state.curItemCustomValue
      });
    }
    this.setState({
      advVisible: false
    });
  };
  handleAdvCancel = () => {
    this.setState({
      advVisible: false
    });
  };
  showAdv = (key, value) => {
    this.setState({
      advVisible: true,
      itemKey: key,
      curItemCustomValue: value // 当前节点的数据信息
    });
  };

  /** 点击高级设置时，记录操作的uiSchema节点 */
  setCurUiItem = (key, value) => {
    this.setState({
      uiItemKey: key
    });
  };


  //  修改弹窗中的json-schema 值
  changeCustomValue = newValue => {
    this.setState({
      curItemCustomValue: newValue
    });
  };

  //  修改弹窗中的json-schema 枚举对应中文值
  changeCustomName = newValue => {
    this.setState({
      curItemCustomValue: newValue
    });
  };

  changeCheckBox = e => {
    this.setState({ checked: e });
    this.Model.requireAllAction({ required: e, value: this.props.schema });
  };

  onFmChange = (value) => {

  }

  render() {
    const {
      visible,
      editVisible,
      advVisible,
      checked,
      editorModalName,
      previewVisible
    } = this.state;

    const { schema, uiSchema, widgets } = this.props;
    console.log('widgets', widgets);

    console.log('schema', schema);

    console.log('uiSchema', uiSchema);
    let disabled =
      this.props.schema.type === 'object' || this.props.schema.type === 'array' ? false : true;

    return (
      <div className="json-schema-react-editor">
        {!this.props.hideImportBtn && <Button className="import-json-button" type="primary" onClick={this.showModal}>
          {LocalProvider('import_json')}
        </Button>
        }
        {this.props.showPreviewBtn && <Button className="import-json-button" type="primary" onClick={this.showPreviewModal}>
          {LocalProvider('preview')}
        </Button>
        }
        <Modal
          maskClosable={false}
          visible={visible}
          title={LocalProvider('import_json')}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          className="json-schema-react-editor-import-modal"
          okText={'ok'}
          cancelText={LocalProvider('cancel')}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              {LocalProvider('cancel')}
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleOk}>
              {LocalProvider('ok')}
            </Button>
          ]}
        >
          <Tabs
            defaultActiveKey="json"
            onChange={key => {
              this.importJsonType = key;
            }}
          >
            <TabPane tab="JSON" key="json">
              <AceEditor data="" mode="json" onChange={this.handleImportJson} />
            </TabPane>
            <TabPane tab="JSON-SCHEMA" key="schema">
              <AceEditor data="" mode="json" onChange={this.handleImportJsonSchema} />
            </TabPane>
          </Tabs>
        </Modal>

        <Modal
          title={
            <div>
              {LocalProvider(editorModalName)}
              &nbsp;
              {editorModalName === 'mock' && (
                <Tooltip title={LocalProvider('mockLink')}>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/YMFE/json-schema-editor-visual/issues/38"
                  >
                    <QuestionCircleOutlined />
                  </a>
                </Tooltip>
              )}
            </div>
          }
          maskClosable={false}
          visible={editVisible}
          onOk={() => this.handleEditOk(editorModalName)}
          onCancel={this.handleEditCancel}
          okText={LocalProvider('ok')}
          cancelText={LocalProvider('cancel')}
        >
          <TextArea
            value={this.state[editorModalName]}
            placeholder={LocalProvider(editorModalName)}
            onChange={e => this.changeDesc(e.target.value, editorModalName)}
            autosize={{ minRows: 6, maxRows: 10 }}
          />
        </Modal>


        <Modal
          maskClosable={false}
          visible={previewVisible}
          title={LocalProvider('preview')}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          className="json-schema-react-editor-import-modal"
          okText={'ok'}
          cancelText={LocalProvider('cancel')}
          footer={[
            <Button key="back" onClick={this.cancelPreviewModal}>
              {LocalProvider('cancel')}
            </Button>,
            <Button key="submit" type="primary" onClick={this.cancelPreviewModal}>
              {LocalProvider('ok')}
            </Button>
          ]}
        >
          <SchemaRenderForm
            schema={schema}
            uiSchema={uiSchema}
            widgets={widgets}
          />
        </Modal>

        {advVisible && (
          <Modal
            title={LocalProvider('adv_setting')}
            maskClosable={false}
            visible={advVisible}
            onOk={this.handleAdvOk}
            onCancel={this.handleAdvCancel}
            okText={LocalProvider('ok')}
            width={780}
            cancelText={LocalProvider('cancel')}
            className="json-schema-react-editor-adv-modal"
          >
            <CustomItem data={JSON.stringify(this.state.curItemCustomValue, null, 2)} />
          </Modal>
        )}
        {this.props.showHeader && <Row>
          {this.props.showEditor && (
            <Col span={6} className="wrapper object-style">
              <Row type="flex" align="middle" style={{ background: 'rgba(0,0,0,.02)' }} className="root-header-wrapper">
                JSON Schema
              </Row>
            </Col>
          )}
          <Col span={this.props.showEditor ? 18 : 24} className="wrapper object-style">
            <Row type="flex" align="middle" style={{ background: 'rgba(0,0,0,.02)' }} className="root-header-wrapper">
              <Col span={8} className="col-item name-item col-item-name">
                <Row type="flex" justify="space-around" align="middle">
                  <Col span={2} className="down-style-col">
                  </Col>
                  <Col span={20}>
                    名称
                  </Col>
                  <Col className="textAlignLeft">
                    必须
                  </Col>
                </Row>
              </Col>
              <Col span={this.props.showGroup ? 2 : 3} style={{ display: "flex", justifyContent: "center" }} className="textAlignLeft">
                <span style={{ width: '90%' }}>类型</span>
              </Col>
              {this.props.isMock && (
                <Col span={this.props.showUiSelect ? 2 : 3} className="textAlignLeft">
                  mock
                </Col>
              )}
              <Col span={this.props.isMock ? this.props.showGroup ? 3 : 4 : this.props.showGroup ? 4 : 5} className="textAlignLeft">
                标题
              </Col>
              <Col span={this.props.isMock ? this.props.showUiSelect ? 3 : 4 : this.props.showUiSelect ? 4 : 5} className="textAlignLeft">
                描述
              </Col>
              {this.props.showGroup && <Col span={2} className="textAlignLeft group-header">
                分组
              </Col>
              }
              {this.props.showUiSelect && <Col span={2} className="textAlignLeft ui-display-header">
                展示
              </Col>}
              <Col span={2} className="textAlignLeft">
                设置
               {schema.type === 'object' && <span onClick={() => this.addChildField('properties')} style={{ marginLeft: 20 }}>
                  <Tooltip placement="top" title={LocalProvider('add_child_node')}>
                    <PlusOutlined className="plus" />
                  </Tooltip>
                </span>}
              </Col>
            </Row>
          </Col>
        </Row>}
        <Row>
          {this.props.showEditor && (
            <Col span={6}>
              <AceEditor
                className="pretty-editor"
                mode="json"
                data={JSON.stringify(schema, null, 2)}
                onChange={this.handleParams}
              />
            </Col>
          )}
          <Col span={this.props.showEditor ? 18 : 24} className="wrapper object-style" style={{ marginTop: this.props.showHeader ? 0 : 8 }}>
            {!this.props.hideRoot && <Row type="flex" align="middle" >
              <Col span={8} className="col-item name-item col-item-name">
                <Row type="flex" justify="space-around" align="middle">
                  <Col span={2} className="down-style-col">
                    {schema.type === 'object' ? (
                      <span className="down-style" onClick={this.clickIcon}>
                        {this.state.show ? (
                          <CaretDownOutlined className="icon-object" />
                        ) : (
                          <CaretRightOutlined className="icon-object" />
                        )}
                      </span>
                    ) : null}
                  </Col>
                  <Col span={22}>
                    <Input
                      addonAfter={
                        <Tooltip placement="top" title={'checked_all'}>
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onChange={e => this.changeCheckBox(e.target.checked)}
                          />
                        </Tooltip>
                      }
                      disabled
                      value="root"
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={this.props.showGroup ? 2 : 3} className="col-item col-item-type">
                <Select
                  className="type-select-style"
                  onChange={e => this.changeType(`type`, e)}
                  value={schema.type}
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
              {this.props.isMock && (
                <Col span={this.props.showUiSelect ? 2 : 3} className="col-item col-item-mock">
                  <MockSelect
                    schema={schema}
                    showEdit={() => this.showEdit([], 'mock', schema.mock, schema.type)}
                    onChange={value => this.changeValue(['mock'], value)}
                  />
                </Col>
              )}
              <Col span={this.props.isMock ? this.props.showGroup ? 3 : 4 : this.props.showGroup ? 4 : 5} className="col-item col-item-mock">
                <Input
                  addonAfter={
                    <EditOutlined
                      onClick={() =>
                        this.showEdit([], 'title', schema.title)
                      } />
                  }
                  placeholder={LocaleProvider('title')}
                  value={schema.title}
                  onChange={e => this.changeValue(['title'], e.target.value)}
                />
              </Col>
              <Col span={this.props.isMock ? this.props.showUiSelect ? 3 : 4 : this.props.showUiSelect ? 4 : 5} className="col-item col-item-desc">
                <Input
                  addonAfter={
                    <EditOutlined
                      onClick={() =>
                        this.showEdit([], 'description', this.props.schema.description)
                      } />
                  }
                  placeholder={LocaleProvider('description')}
                  value={schema.description}
                  onChange={e => this.changeValue(['description'], e.target.value)}
                />
              </Col>
              {this.props.showGroup && <Col span={2} className="col-item col-item-group">
                <Input
                  placeholder={LocaleProvider('group')}
                  value={schema.group}
                  onChange={e => this.changeValue(['group'], e.target.value)}
                />
              </Col>}
              {this.props.showUiSelect && <Col span={2} className="col-item col-item-ui">
                <Select
                  className="type-select-style"
                  onChange={value => this.changeUiWidget(null, value)}
                  value={uiSchema['uiKey']}
                  disabled={schema.type === 'object'}
                >
                  {filterUiType(schema.type).map((item, index) => {
                    return (
                      <Option value={item.uiKey} key={index}>
                        {item.label}
                      </Option>
                    );
                  })}
                </Select>
              </Col>}
              <Col span={2} className="col-item col-item-setting">
                <span className="adv-set" onClick={() => {
                  this.showAdv([], this.props.schema);
                  this.setCurUiItem([], this.props.uiSchema);
                }}>
                  <Tooltip placement="top" title={LocalProvider('adv_setting')}>
                    <SettingOutlined />
                  </Tooltip>
                </span>
                {schema.type === 'object' ? (
                  <span onClick={() => this.addChildField('properties')}>
                    <Tooltip placement="top" title={LocalProvider('add_child_node')}>
                      <PlusOutlined className="plus" />
                    </Tooltip>
                  </span>
                ) : null}
              </Col>
            </Row>}
            {this.state.show && (
              <SchemaJson
                data={schema}
                uiSchema={uiSchema}
                showEdit={this.showEdit}
                showAdv={this.showAdv}
              />
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

jsonSchema.childContextTypes = {
  getOpenValue: PropTypes.func,
  changeCustomValue: PropTypes.func,
  Model: PropTypes.object,
  UiModel: PropTypes.object,
  isMock: PropTypes.bool,
  showGroup: PropTypes.bool,
  showUiSelect: PropTypes.bool,
};

jsonSchema.propTypes = {
  data: PropTypes.string,
  onChange: PropTypes.func,
  showEditor: PropTypes.bool,
  isMock: PropTypes.bool,
  showGroup: PropTypes.bool,
  showUiSelect: PropTypes.bool,
  Model: PropTypes.object,
  UiModel: PropTypes.object,
  widgets: PropTypes.object,
  customWidgets: PropTypes.array
};

export default connect(state => ({
  schema: state.schema.data,
  uiSchema: state.uiSchema.data,
  open: state.schema.open
}))(jsonSchema);
