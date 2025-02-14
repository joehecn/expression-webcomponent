
/**
 * 暂时解决 Storybook 预览的 runtime.js 预加载问题
 * 等待官方解决方案后，删除该脚本
 */

// node scripts/delete-sb-preview.js

// 读取 html 文件
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const htmlPath = path.resolve(__dirname, '../storybook-static/index.html')

const html = fs.readFileSync(htmlPath, 'utf-8')

// // 保存 html 文件
const newHtml = html.replace('<link href="./sb-preview/runtime.js" rel="prefetch" as="script" />', '')

fs.writeFileSync(htmlPath, newHtml)
