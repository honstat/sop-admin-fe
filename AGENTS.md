# SOP Admin FE 项目上下文

## 项目概述

SOP Admin FE 是一个 **SOP（标准操作流程）管理后台** 的前端项目，用于管理和监控 SOP 工作流实例、任务调度、文章发布和评论审核等业务。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.4.0 | 前端框架 |
| Vite | ^5.0.0 | 构建工具 |
| Vue Router | ^4.2.5 | 路由管理 |
| Element Plus | ^2.5.0 | UI 组件库 |
| Axios | ^1.6.0 | HTTP 请求 |
| ECharts | ^5.4.0 | 图表可视化 |

## 项目结构

```
src/
├── main.js           # 入口文件，注册 Element Plus 和图标
├── App.vue           # 根组件，仅包含 router-view
├── api/
│   ├── index.js      # Axios 实例配置，baseURL: http://101.43.66.93:10000
│   └── modules.js    # API 接口定义
├── assets/
│   └── base.css      # 全局样式
├── router/
│   └── index.js      # 路由配置（嵌套路由，Layout 为父级）
└── views/
    ├── Layout.vue        # 主布局（侧边栏 + 顶栏 + 内容区）
    ├── Dashboard.vue     # 总览页面（统计卡片 + ECharts 饼图）
    ├── DefinitionList.vue    # SOP 定义列表
    ├── DefinitionDetail.vue  # SOP 定义详情
    ├── InstanceList.vue      # 实例列表（支持状态筛选、时间范围）
    ├── InstanceDetail.vue    # 实例详情
    ├── JobList.vue           # 任务管理
    ├── ArticleList.vue       # 文章管理
    ├── ArticleComment.vue    # 评论生成（知乎文章评论）
    └── CommentReview.vue     # 评论审核
```

## 构建与运行

```bash
# 开发环境（端口 10001）
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## API 接口概览

后端地址：`http://101.43.66.93:10000`

### SOP 管理
- `GET /api/admin/definitions` - 获取 SOP 定义列表
- `GET /api/admin/definitions/:id` - 获取 SOP 定义详情
- `POST /api/admin/definitions` - 创建 SOP 定义
- `PUT /api/admin/definitions/:id` - 更新 SOP 定义
- `DELETE /api/admin/definitions/:id` - 删除 SOP 定义

### 实例管理
- `GET /api/admin/instances` - 获取实例列表
- `GET /api/admin/instances/:id` - 获取实例详情
- `POST /api/admin/instances/:id/cancel` - 取消实例
- `GET /api/admin/instances/:id/logs` - 获取实例日志
- `POST /api/sop/instances` - 创建 SOP 实例
- `POST /api/sop/instances/:id/transition` - 触发状态流转

### 任务管理
- `GET /api/admin/jobs` - 获取任务列表
- `POST /api/admin/jobs/:id/trigger` - 手动触发任务
- `POST /api/admin/jobs/:id/pause` - 暂停任务
- `POST /api/admin/jobs/:id/resume` - 恢复任务

### 文章与评论
- `GET /api/admin/articles` - 获取文章列表
- `GET /api/zhihu/article` - 获取知乎文章
- `POST /api/zhihu/generate-comment` - 生成评论
- `GET /api/zhihu/comments/review` - 获取待审核评论
- `POST /api/zhihu/comments/review` - 提交评论审核
- `POST /api/zhihu/comments/publish` - 发布评论

## 路由配置

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/dashboard` | Dashboard | Dashboard.vue | 总览 |
| `/definitions` | Definitions | DefinitionList.vue | SOP 定义列表 |
| `/definitions/:id` | DefinitionDetail | DefinitionDetail.vue | SOP 定义详情 |
| `/instances` | Instances | InstanceList.vue | 实例列表 |
| `/instances/:id` | InstanceDetail | InstanceDetail.vue | 实例详情 |
| `/jobs` | Jobs | JobList.vue | 任务管理 |
| `/articles` | Articles | ArticleList.vue | 文章管理 |
| `/article-comments` | ArticleComments | ArticleComment.vue | 评论生成 |
| `/comment-review` | CommentReview | CommentReview.vue | 评论审核 |

## 开发约定

### 组件风格
- 使用 Vue 3 Composition API (`<script setup>`)
- Element Plus 组件按需使用，全局已注册所有图标
- 样式使用 `<style scoped>`

### API 调用
- 统一使用 `src/api/modules.js` 中导出的函数
- 响应拦截器已处理：成功时返回 `response.data.data`，失败时显示 `ElMessage.error`

### 状态管理
- 当前项目未使用状态管理库（Pinia/Vuex），组件状态使用 `ref`/`reactive`

## 注意事项

1. **开发服务器端口**：固定为 `10001`，需确保端口未被占用
2. **后端依赖**：项目依赖后端 API 服务 (`http://101.43.66.93:10000`)
3. **构建输出**：`dist/` 目录已配置在 `.gitignore` 中
