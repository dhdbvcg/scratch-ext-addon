// 构建脚本：把 provider/tools/store/AIAssistant 4 个文件打包成单文件 UMD，
// 暴露 window.ExtEditAI_AIAssistant（即 AIAssistant 默认组件）。
// 为避免源码里的反引号/`${}` 破坏外层模板字符串，这里对每个模块做 base64 编码，
// 运行时解码后 eval（在模块函数作用域内）。
const fs = require('fs');
const path = require('path');

const BABEL_ROOT = 'C:\\Users\\dell\\scratch-gui\\node_modules';
const babel = require(path.join(BABEL_ROOT, '@babel/core'));

const SRC = __dirname + '\\lib';
const OUT = __dirname + '\\lib\\ai-assistant.umd.js';

const files = {
  store: 'store.js',
  provider: 'provider.js',
  tools: 'tools.js',
  ai: 'AIAssistant.jsx',
};

function transpile(file) {
  const code = fs.readFileSync(path.join(SRC, file), 'utf8');
  const res = babel.transformSync(code, {
    filename: file,
    presets: [
      [path.join(BABEL_ROOT, '@babel/preset-env'), { targets: { browsers: ['last 2 versions'] } }],
      path.join(BABEL_ROOT, '@babel/preset-react'),
    ],
    plugins: [],
  });
  return res.code;
}

function b64(s) {
  // Node Buffer -> base64
  return Buffer.from(s, 'utf8').toString('base64');
}

const chunks = {
  store: b64(transpile(files.store)),
  provider: b64(transpile(files.provider)),
  tools: b64(transpile(files.tools)),
  ai: b64(transpile(files.ai)),
};

const wrapped = `
(function(global){
  'use strict';
  function _decode(b){ try { return decodeURIComponent(escape(atob(b))); } catch(e){ return atob(b); } }
  var ReactNS = (global.React || (typeof window!=='undefined'&&window.React));
  var ReactDOMNS = (global.ReactDOM || (typeof window!=='undefined'&&window.ReactDOM));
  var modules = {
    'react': function(m,e,r){ e.default = ReactNS; e.__esModule = true; },
    'react-dom': function(m,e,r){ e.default = ReactDOMNS; e.__esModule = true; }
  };
  var cache = {};
  function req(name){
    if (cache[name]) return cache[name].exports;
    var key = name.replace(/^\\.\\//, '');
    if (!modules[name] && modules[key]) name = key;
    if (!modules[name]) throw new Error('Module not found: ' + name);
    var module = { exports: {} };
    cache[name] = module;
    modules[name](module, module.exports, req);
    return module.exports;
  }
  var require = req;
  var _src = ${JSON.stringify(chunks)};
  function defineFromB64(name, b64){ modules[name] = new Function('module','exports','require', _decode(b64)); }
  defineFromB64('store', _src.store);
  defineFromB64('provider', _src.provider);
  defineFromB64('tools', _src.tools);
  defineFromB64('ai', _src.ai);
  var aiMod = req('ai');
  global.ExtEditAI_AIAssistant = (aiMod && aiMod.default) ? aiMod.default : aiMod;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
`;

fs.writeFileSync(OUT, wrapped);
console.log('Built UMD ->', OUT, '(', wrapped.length, 'bytes )');
