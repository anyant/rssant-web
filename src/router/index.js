import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes'

import { API } from '@/store'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routes
})

router.beforeEach((to, from, next) => {
  const loginRequired = to.matched.some(record => record.meta.loginRequired)
  const goLogin = () => next({
    path: '/login',
    query: { redirect: to.fullPath }
  })
  const goNext = () => next()
  if (loginRequired) {
    API.user.login().then(goNext).catch(goLogin)
  } else {
    API.user.login().catch(() => null).finally(goNext)
  }
})

export default router
