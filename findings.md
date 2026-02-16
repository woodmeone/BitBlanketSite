# 研究发现

## 当前架构问题

### 1. 数据库连接问题
- **问题**: `getDB()` 依赖 `Astro.locals.runtime?.env?.DB`
- **原因**: 只有在 Cloudflare 环境中才有此对象
- **本地开发**: `pnpm dev` 使用 Node.js，没有 D1 绑定
- **结果**: 所有数据库操作返回 `null`

### 2. 内容来源分离
- **前台**: 使用 `src/content/` 下的 Markdown/JSON 文件
- **后台**: 使用 D1 数据库
- **问题**: 两者完全独立，后台修改不影响前台显示

### 3. 现有内容集合
```
src/content/
├── blog/          # Markdown 文件
├── projects/      # JSON 文件
└── software/      # JSON 文件
```

---

## 解决方案研究

### 方案 B 实现要点

#### 1. 本地开发环境
```bash
# 使用 wrangler pages dev 替代 astro dev
wrangler pages dev dist --compatibility-date=2024-01-01 --binding DB=<local-db>
```

或者使用 `.dev.vars` 文件配置本地环境变量。

#### 2. 构建时数据获取
Astro 支持在构建时调用 API：
```typescript
// astro.config.mjs
export default defineConfig({
  output: 'static', // 或 'hybrid'
  // 构建时可以访问环境变量
});
```

#### 3. 混合渲染模式
Astro 支持 `hybrid` 模式：
- 大部分页面静态生成
- 部分页面按需渲染

---

## 技术选型

### 本地 D1 解决方案

**选项 1: wrangler pages dev**
- 优点: 完整模拟 Cloudflare 环境
- 缺点: 需要先构建，不支持热重载

**选项 2: Miniflare**
- 优点: 更轻量，支持热重载
- 缺点: 配置复杂

**选项 3: 本地 SQLite 模拟**
- 优点: 简单，开发体验好
- 缺点: 与生产环境有差异

**选择**: 先尝试选项 1，如果体验不好再考虑选项 3

---

## 关键代码位置

| 功能 | 文件 |
|------|------|
| 数据库连接 | `src/lib/db.ts` |
| API 路由 | `src/pages/api/*.ts` |
| 内容集合 | `src/content/config.ts` |
| 前台页面 | `src/pages/blog/*.astro` |
| 管理后台 | `src/pages/admin/*.astro` |

---

## 下一步行动

1. 配置 wrangler 本地开发
2. 创建数据库迁移脚本
3. 实现构建时数据获取
4. 重构前台页面
