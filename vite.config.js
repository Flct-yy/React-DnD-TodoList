import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// 自动别名插件
import autoAlias from 'vite-plugin-auto-alias'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    autoAlias(),
  ],
  resolve: {
    // 自动解析文件扩展名
    extensions: ['.js', '.jsx'],
  },
})
