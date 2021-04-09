import React, { useState } from 'react';
// 使用 Ant Design 风格
import FormRender from 'form-render/lib/antd';
// 使用 Fusion 风格
// import FormRender from 'form-render/lib/fusion';
// import '@alifd/next/dist/next.min.css';

function SchemaRenderForm({ schema,uiSchema,widgets }) {
  const [formData, setData] = useState({});
  const [valid, setValid] = useState([]);
  const submit = () => {
    if (valid.length > 0) {
      alert('未通过校验字段：' + valid.join(','));
    } else {
      alert(JSON.stringify(formData, null, 2));
    }
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
      <button onClick={submit}>校验</button>
    </div>
  );
}

export default SchemaRenderForm;