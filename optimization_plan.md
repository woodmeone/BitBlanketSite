# 比特毯子项目优化计划

> 版本：1.0  
> 日期：2026-02-16  
> 状态：规划中

---

## 一、项目当前状态

### 1.1 已完成功能

根据 `task_plan.md` 记录，以下阶段已完成：

| 阶段 | 状态 | 说明 |
|------|------|------|
| Phase 1: 本地开发环境配置 | ✅ 完成 | LocalDatabase 模拟数据库 |
| Phase 2: 数据库 Schema 完善 | ✅ 完成 | 隐藏域、使用场景、管理员回复 |
| Phase 3: 构建时数据获取 | ✅ 完成 | data-service.ts |
| Phase 4: 前台页面重构 | ✅ 完成 | 随笔、分享、项目、待办、粉丝互动 |
| Phase 5: 管理后台修复 | ✅ 完成 | CRUD 操作正常 |
| Phase 6: 部署配置 | ✅ 完成 | Cloudflare Pages 部署成功 |

**生产环境**: https://671992df.bit-blanket.pages.dev

### 1.2 已修复问题

| 问题 | 解决方案 |
|------|----------|
| software/index.astro 导入路径错误 | 修复为 `../../layouts/BaseLayout.astro` |
| software/[slug].astro 导入路径错误 | 修复为 `../../layouts/BaseLayout.astro` |

---

## 二、待优化功能

### 2.1 功能完善（P0 - 高优先级）

#### 2.1.1 动画系统

**现状**: animations.css 存在，但 GSAP 动画未完全集成

**待实现**:
- [ ] 拼贴入场动画（喜鹊谋杀案风格）
- [ ] 页面过渡动画
- [ ] 滚动触发动画
- [ ] 悬浮交互效果

**文件位置**: 
- `src/styles/animations.css`
- `src/scripts/gsap-animations.ts`（待创建）

#### 2.1.2 心情主题系统

**现状**: MoodThemeSelector.vue 组件存在

**待实现**:
- [ ] 主题 CSS 变量完善
- [ ] 主题切换动画
- [ ] 主题持久化（localStorage）
- [ ] 4种心情主题：快乐、平静、创意、专注

**文件位置**:
- `src/components/MoodThemeSelector.vue`
- `src/styles/global.css`

#### 2.1.3 暗色模式

**现状**: 部分支持

**待实现**:
- [ ] 完善暗色模式 CSS 变量
- [ ] 跟随系统主题
- [ ] 主题切换按钮
- [ ] 暗色模式下的拼贴效果适配

### 2.2 性能优化（P1 - 中优先级）

#### 2.2.1 图片优化

- [ ] 图片懒加载实现
- [ ] 响应式图片（srcset）
- [ ] WebP 格式支持
- [ ] 图片占位符

#### 2.2.2 代码优化

- [ ] 代码分割优化
- [ ] 第三方库按需加载
- [ ] CSS 压缩优化
- [ ] 预加载关键资源

#### 2.2.3 缓存策略

- [ ] 静态资源缓存配置
- [ ] API 响应缓存
- [ ] Service Worker（可选）

### 2.3 SEO 优化（P1 - 中优先级）

- [ ] Sitemap 自动生成验证
- [ ] robots.txt 配置
- [ ] Open Graph 标签完善
- [ ] Twitter Card 标签
- [ ] 结构化数据（JSON-LD）
- [ ] Canonical URL 配置

### 2.4 功能增强（P2 - 低优先级）

#### 2.4.1 Notion 待办同步

**现状**: API 存在但可能未完全集成

**待实现**:
- [ ] Notion API 环境变量配置
- [ ] 待办数据展示优化
- [ ] 缓存机制

#### 2.4.2 搜索功能

- [ ] 全站搜索 API
- [ ] 搜索结果高亮
- [ ] 搜索历史

#### 2.4.3 RSS 订阅

- [ ] RSS Feed 生成
- [ ] 订阅链接展示

---

## 三、优化执行计划

### 3.1 第一阶段：核心功能完善（预计 2-3 天）

```
Day 1: 动画系统
├── GSAP 集成配置
├── 拼贴入场动画实现
├── 页面过渡动画
└── 滚动触发动画

Day 2: 主题系统
├── 心情主题 CSS 变量
├── 主题切换组件完善
├── 暗色模式完善
└── 主题持久化

Day 3: 测试验证
├── 动画效果测试
├── 主题切换测试
├── 响应式测试
└── 性能测试
```

### 3.2 第二阶段：性能与 SEO（预计 1-2 天）

```
Day 4: 性能优化
├── 图片懒加载
├── 代码分割
├── 缓存配置
└── Lighthouse 测试

Day 5: SEO 优化
├── Sitemap 验证
├── Meta 标签完善
├── 结构化数据
└── 搜索引擎提交
```

### 3.3 第三阶段：功能增强（预计 1 天）

```
Day 6: 功能增强
├── Notion 同步完善
├── 搜索功能
├── RSS 订阅
└── 最终测试
```

---

## 四、技术细节

### 4.1 GSAP 动画配置

```typescript
// src/scripts/gsap-animations.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCollageAnimation() {
  const items = document.querySelectorAll('.collage-item');
  
  items.forEach((item, index) => {
    gsap.from(item, {
      duration: 1.5,
      x: () => Math.random() * window.innerWidth - window.innerWidth / 2,
      y: () => Math.random() * window.innerHeight - window.innerHeight / 2,
      rotation: () => Math.random() * 720 - 360,
      scale: 0,
      opacity: 0,
      delay: index * 0.1,
      ease: 'back.out(1.7)',
    });
  });
}
```

### 4.2 心情主题变量

```css
/* 快乐主题 */
[data-theme="happy"] {
  --accent-primary: #FFD700;
  --accent-secondary: #FFA500;
  --mood-bg: linear-gradient(135deg, #fff9c4 0%, #ffecb3 100%);
}

/* 平静主题 */
[data-theme="calm"] {
  --accent-primary: #87CEEB;
  --accent-secondary: #4682B4;
  --mood-bg: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

/* 创意主题 */
[data-theme="creative"] {
  --accent-primary: #FF69B4;
  --accent-secondary: #FF1493;
  --mood-bg: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
}

/* 专注主题 */
[data-theme="focus"] {
  --accent-primary: #4CAF50;
  --accent-secondary: #2E7D32;
  --mood-bg: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}
```

### 4.3 图片懒加载

```astro
<!-- 使用原生懒加载 -->
<img 
  src={image.src} 
  alt={image.alt}
  loading="lazy"
  decoding="async"
/>

<!-- 或使用 Astro 的 Image 组件 -->
<Image 
  src={image.src}
  alt={image.alt}
  loading="lazy"
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

## 五、验收标准

### 5.1 动画系统

- [ ] 首页拼贴元素入场动画流畅
- [ ] 页面切换过渡自然
- [ ] 滚动触发动画正确
- [ ] 悬浮交互反馈及时
- [ ] 动画不影响性能（FPS > 30）

### 5.2 主题系统

- [ ] 4种心情主题切换正常
- [ ] 暗色模式切换正常
- [ ] 主题选择持久化
- [ ] 主题切换动画流畅

### 5.3 性能指标

- [ ] Lighthouse 性能分数 > 90
- [ ] Lighthouse SEO 分数 > 95
- [ ] 首屏加载时间 < 2s
- [ ] 最大内容绘制（LCP） < 2.5s

---

## 六、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| GSAP 动画影响性能 | 中 | 使用 will-change 优化，减少动画元素 |
| 主题切换闪烁 | 低 | 预加载主题 CSS，使用 CSS 过渡 |
| 图片加载失败 | 低 | 添加占位图和错误处理 |

---

## 七、版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2026-02-16 | 初始版本 |

---

**文档结束**
