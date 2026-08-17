import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Qoder AI 企业级开发实战',
  description: '从 0 到 1，用 AI 辅助开发一个企业级电商系统',
  lang: 'zh-CN',
  // GitHub Pages 部署在 https://<user>.github.io/qoder-study-quest/，需设置 base
  base: '/qoder-study-quest/',
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: '课程总览', link: '/' },
      { text: '环境准备手册', link: '/environment-setup' },
      { text: '项目规格书', link: '/project-spec' },
      { text: '讲义目录', link: '/lectures/01-ai-dev-and-qoder-intro' }
    ],

    sidebar: [
      {
        text: '课程入口',
        items: [
          { text: '课程总览', link: '/' },
          { text: '环境准备手册', link: '/environment-setup' },
          { text: 'QShop 项目规格书', link: '/project-spec' }
        ]
      },
      {
        text: '第一部分：AI 编程认知建立',
        items: [
          { text: '01 AI 编程是什么 + Qoder 初体验', link: '/lectures/01-ai-dev-and-qoder-intro' },
          { text: '02 Agent 生态概念扫盲', link: '/lectures/02-agent-ecosystem-concepts' },
          { text: '03 Spec 驱动开发与 OpenSpec 实战', link: '/lectures/03-openspec-driven-development' }
        ]
      },
      {
        text: '第二部分：项目启动与后端核心',
        items: [
          { text: '04 需求分析与项目启动', link: '/lectures/04-requirements-and-project-setup' },
          { text: '05 数据库设计', link: '/lectures/05-database-design' },
          { text: '06 分层架构与工程脚手架', link: '/lectures/06-architecture-and-scaffolding' },
          { text: '07 认证与 RBAC 权限', link: '/lectures/07-auth-and-rbac' },
          { text: '08 商品与分类模块', link: '/lectures/08-product-and-category' },
          { text: '09 购物车与订单', link: '/lectures/09-cart-and-order' },
          { text: '10 支付、库存与并发', link: '/lectures/10-payment-stock-concurrency' }
        ]
      },
      {
        text: '第三部分：前端与联调',
        items: [
          { text: '11 Vue 前端工程搭建', link: '/lectures/11-vue-frontend-setup' },
          { text: '12 AI 驱动的前端页面开发', link: '/lectures/12-frontend-pages-with-ai' },
          { text: '13 前后端联调与调试', link: '/lectures/13-integration-and-debugging' }
        ]
      },
      {
        text: '第四部分：企业级进阶与总结',
        items: [
          { text: '14 测试与代码质量', link: '/lectures/14-testing-and-code-review' },
          { text: '15 缓存、安全与性能', link: '/lectures/15-cache-security-performance' },
          { text: '16 部署上线与课程总结', link: '/lectures/16-deployment-and-summary' }
        ]
      }
    ],

    outline: {
      level: [2, 3],
      label: '本页目录'
    },

    docFooter: {
      prev: '上一讲',
      next: '下一讲'
    },

    lastUpdated: {
      text: '最后更新'
    },

    footer: {
      message: 'Qoder AI 企业级开发实战课程',
      copyright: '以 QShop 电商系统为实战载体的 16 讲完整教程'
    },

    search: {
      provider: 'local'
    }
  }
})
