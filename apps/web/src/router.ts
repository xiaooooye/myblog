import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/HomePage.vue') },
    { path: '/posts', component: () => import('./pages/PostsPage.vue') },
    { path: '/posts/:id', component: () => import('./pages/PostDetailPage.vue') },
    { path: '/archive', component: () => import('./pages/ArchivePage.vue') },
    { path: '/tags', component: () => import('./pages/TagsPage.vue') },
    { path: '/about', component: () => import('./pages/AboutPage.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('./pages/NotFoundPage.vue') },
  ],
})
