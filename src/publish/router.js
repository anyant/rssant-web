import Router from 'vue-router'
import PubHomePage from '@/publish/views/HomePage'

const routes = [
  {
    path: '/rssant/',
    name: 'Home',
    component: PubHomePage,
  },
]

export function createPublishRouter() {
  return new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: routes,
  })
}
