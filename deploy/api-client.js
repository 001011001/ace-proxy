/**
 * AceProxy API Client — 统一 API 请求封装
 *
 * 使用方法:
 *   const data = await API.api('/product/list?limit=20');
 *   API.setToken(accessToken);
 *
 * 特性:
 *   - 自动检测 base URL（本地/CloudStudio/生产）
 *   - 自动附加 Bearer token
 *   - 统一错误处理
 *   - 响应自动解析 JSON
 */

(function () {
  'use strict';

  var API_BASE = (function () {
    var host = typeof location !== 'undefined' ? location.hostname : '';
    // CloudStudio / CodeBuddy 预览 → 使用 fallback
    if (host.includes('.codebuddy.work') || host.includes('app.codebuddy')) {
      return window.ACE_PROXY_API || 'http://localhost:3002/api/v1';
    }
    // 本地开发
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      return 'http://localhost:3002/api/v1';
    }
    // 生产环境
    return location.protocol + '//' + host.replace(':443', '').replace(':8443', '') + ':3001/api/v1';
  })();

  var TOKEN_KEY = 'ace_jwt';

  /**
   * 从 localStorage 获取 token（支持多种 key）
   */
  function getStoredToken() {
    return (
      localStorage.getItem('ace_jwt') ||
      localStorage.getItem('ace_token') ||
      localStorage.getItem('ace_admin_jwt') ||
      ''
    );
  }

  /**
   * 核心请求函数
   * @param {string} path - API 路径，如 /product/list
   * @param {object} options - fetch options
   * @returns {Promise<any>} 解析后的 JSON 响应
   */
  async function api(path, options) {
    options = options || {};
    var token = getStoredToken();
    var headers = { 'Content-Type': 'application/json' };
    if (options.headers) {
      Object.assign(headers, options.headers);
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    var url = API_BASE + path;
    var res;
    try {
      res = await fetch(url, Object.assign({}, options, { headers: headers }));
    } catch (e) {
      throw new Error('Network error: ' + e.message);
    }

    if (!res.ok) {
      var errBody = '';
      try {
        errBody = await res.text();
      } catch (_) {
        /* ignore */
      }
      var err;
      try {
        err = JSON.parse(errBody);
      } catch (_) {
        err = { message: 'HTTP ' + res.status };
      }
      err.status = res.status;
      throw err;
    }

    return res.json();
  }

  /**
   * 安全 API 调用（带 fallback）
   * @param {string} path
   * @param {object} options
   * @param {*} fallbackValue - API 失败时返回的兜底值
   * @returns {Promise<any>}
   */
  async function apiSafe(path, options, fallbackValue) {
    try {
      return await api(path, options);
    } catch (e) {
      console.warn('[AceProxy API] ' + path + ' failed:', e.message || e);
      return fallbackValue;
    }
  }

  // 导出到 window 供 HTML 使用
  window.API = {
    api: api,
    apiSafe: apiSafe,
    API_BASE: API_BASE,
    TOKEN_KEY: TOKEN_KEY,
    setToken: function (t) {
      localStorage.setItem(TOKEN_KEY, t);
    },
    getToken: getStoredToken,
    clearToken: function () {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('ace_token');
    },
  };

  console.log('[AceProxy] API Client initialized. Base:', API_BASE);
})();
