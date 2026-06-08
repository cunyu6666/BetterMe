/**
 * [WHO]: 提供 React 应用启动入口（createRoot 挂载到 #root，包 StrictMode）
 * [FROM]: 依赖 react / react-dom 的 createRoot 与 StrictMode；引入 ./index.css 全局样式；引入 ./App 作为根组件
 * [TO]: 被 index.html 通过 <script type="module" src="/src/main.tsx"> 直接消费（Vite 入口）
 * [HERE]: src/main.tsx - 应用启动点；与 index.html 一对一锚定；不持有任何业务状态
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error)
  })
}
