import React, { useState } from 'react';
// 使用 Ant Design 风格
import FormRender from 'form-render/lib/antd';
import { message } from 'antd';
import copy from 'copy-to-clipboard';
import {isJsonString, combineSchema } from './utils';
// 使用 Fusion 风格
// import FormRender from 'form-render/lib/fusion';
// import '@alifd/next/dist/next.min.css';

function SchemaRenderForm({ schema,uiSchema,widgets }) {
  const [formData, setData] = useState({});
  const [valid, setValid] = useState([]);
  console.log('valid',valid)
  const handleCopy = () => {
    const schemaObj = isJsonString(schema) ? JSON.parse(schema) : schema;
    const uiSchemaObj = isJsonString(uiSchema) ? JSON.parse(uiSchema) : uiSchema;
    const combinedSchema = combineSchema(schemaObj, uiSchemaObj);
    copy(JSON.stringify(combinedSchema));
    message.success('复制成功');
  };
  console.log('SchemaRenderForm',widgets);
  return (
    <div style={{ maxWidth: 600 }}>
      <FormRender
        schema={schema}
        uiSchema={ uiSchema}
        formData={formData}
        onChange={setData}
        onValidate={setValid}
        displayType="row" // 详细配置见下
        showDescIcon={true}
        widgets={ widgets }
      />
      <button onClick={handleCopy}>复制</button>
    </div>
  );
}

export default SchemaRenderForm;