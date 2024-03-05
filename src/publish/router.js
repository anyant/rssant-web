import Router from 'vue-router'
import PubHomePage from '@/publish/views/HomePage'
import PubNotFoundPage from '@/publish/views/NotFoundPage'

const routes = [
  {
    path: '/rssant/',
    name: 'PubHome',
    component: PubHomePage,
  },
  { path: '*', component: PubNotFoundPage },
]

export function createPublishRouter() {
  return new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: routes,
  })
}
