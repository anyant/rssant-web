import Vue from 'vue'
import Router from 'vue-router'
import Toast from 'muse-ui-toast';
import _ from 'lodash'

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
  const goLogin = (error) => {
    let response = error.response
    // When "Network Error", not redirect to login
    // https://github.com/axios/axios/issues/383
    if(_.isNil(response) && _.isNil(error.status)){
      return goNext()
    }
    if (response && response.status >= 500) {
      Toast.error(error.message)
      return next(false)
    }
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
  const goNext = () => next()
  if (loginRequired) {
    API.user.login().then(goNext).catch(goLogin)
  } else {
    API.user.login().catch(() => null).finally(goNext)
  }
})

export default router
