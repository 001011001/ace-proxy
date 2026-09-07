/// <reference types="vite/client" />

/**
 * Vite 环境变量与资源模块类型声明
 *
 * 启用后可获得：
 * - import.meta.env（如 VITE_API_BASE_URL）
 * - import.meta.hot（HMR）
 * - 静态资源导入（.svg/.png 等）的类型支持
 */

interface ImportMetaEnv {
  /** 后端 API 基础地址，默认 /api/v1（走 Vite proxy） */
  readonly VITE_API_BASE_URL?: string;
  /** 后端直连地址（开发调试用，如 http://localhost:3001） */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
