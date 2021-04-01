import React from 'react'
import { Provider } from 'react-redux'
import App from './App.js'
import moox from 'moox'
import schema from './models/schema'
import uiSchema from './models/uiSchema'
import PropTypes from 'prop-types'
const utils = require('./utils');

export { default as FormRender } from 'form-render/lib/antd';

export default  (config = {})=>{
  if(config.lang) utils.lang = config.lang;
  
  const Model = moox({
    schema,
    uiSchema
  })
  if(config.format){
    Model.__jsonSchemaFormat = config.format
  } else {
    Model.__jsonSchemaFormat = utils.format
  }

  if(config.mock) {
    Model.__jsonSchemaMock = config.mock
  }

  

  const store = Model.getStore();

  const Component = (props)=>{
    return <Provider store={store} className="wrapper">
      <App Model={Model} {...props} />
    </Provider>
  }

  Component.propTypes = {
    data: PropTypes.string,
    onChange: PropTypes.func,
    showEditor: PropTypes.bool
  }
  return Component;

}
