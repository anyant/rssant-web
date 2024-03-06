import Router from 'vue-router'
import PubHomePage from '@/publish/views/HomePage'
import PubFeedDetailPage from '@/publish/views/FeedDetailPage'
import PubNotFoundPage from '@/publish/views/NotFoundPage'
import { enableSafeBack } from '@/router'

const routes = [
  {
    path: '/rssant/',
    name: 'PubHome',
    component: PubHomePage,
  },
  {
    path: '/rssant/feed-detail',
    name: 'PubFeedDetailPage',
    component: PubFeedDetailPage,
  },
  { path: '*', component: PubNotFoundPage },
]

export function createPublishRouter() {
  const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: routes,
  })
  enableSafeBack(router, { fallback: '/rssant/' })
  return router
}
