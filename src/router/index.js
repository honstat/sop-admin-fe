import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
      { path: 'definitions', name: 'Definitions', component: () => import('../views/DefinitionList.vue') },
      { path: 'definitions/:id', name: 'DefinitionDetail', component: () => import('../views/DefinitionDetail.vue') },
      { path: 'instances', name: 'Instances', component: () => import('../views/InstanceList.vue') },
      { path: 'instances/:id', name: 'InstanceDetail', component: () => import('../views/InstanceDetail.vue') },
      { path: 'jobs', name: 'Jobs', component: () => import('../views/JobList.vue') },
      { path: 'articles', name: 'Articles', component: () => import('../views/ArticleList.vue') },
      { path: 'article-comments', name: 'ArticleComments', component: () => import('../views/ArticleComment.vue') },
      { path: 'comment-review', name: 'CommentReview', component: () => import('../views/CommentReview.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
