import React from 'react'
import { Provider } from 'react-redux'
import App from './App.js'
import moox from 'moox'
import schema from './models/schema'
import uiSchema from './models/uiSchema'
import PropTypes from 'prop-types';
import { setLang , format, combineSchema } from './utils';

export default  (config = {})=>{
  if(config.lang) setLang(config.lang);
  
  const Model = moox({
    schema,
    uiSchema
  })
  if(config.format){
    Model.__jsonSchemaFormat = config.format
  } else {
    Model.__jsonSchemaFormat = format
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
    showEditor: PropTypes.bool,
    isMock: PropTypes.bool,
    showHeader: PropTypes.bool,
    hideRoot: PropTypes.bool,
    hideImportBtn: PropTypes.bool,
    showPreviewBtn: PropTypes.bool,
    showGroup: PropTypes.bool,
    showUiSelect: PropTypes.bool,
    options: PropTypes.object,
    customWidgets: PropTypes.array,
    widgets: PropTypes.object,
  }
  return Component;

}

export const combineUiSchema= combineSchema;