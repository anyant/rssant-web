import Router from 'vue-router'
import Toast from 'muse-ui-toast'
import _ from 'lodash'

import localConfig from '@/plugin/localConfig'
import routes from './routes'
import { userStore } from '@/store/user'

export const keepAlivePages = ['MoHomePage', 'MoMushroomPage', 'MoAccountPage', 'MoFeedCreationPage']

export function enableSafeBack(router, { fallback } = {}) {
  // when landing page not '/', router.back() may be a trouble
  router._numRouteVistied = -1
  router.safeBack = function() {
    if (router._numRouteVistied < 1) {
      router.replace(fallback || '/')
    } else {
      router.back()
    }
  }
  router.beforeEach((to, from, next) => {
    // after some path visited, browser history can go back safely
    if (router._numRouteVistied < 1) {
      router._numRouteVistied += 1
    }
    next()
  })
}

export function createRouter() {
  const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: routes,
  })
  enableSafeBack(router)
  router.beforeEach((to, from, next) => {
    const loginRequired = to.matched.some(record => record.meta.loginRequired)
    const goLogin = error => {
      let response = error.response
      // When "Network Error", not redirect to login
      // https://github.com/axios/axios/issues/383
      if (_.isNil(response) && _.isNil(error.status)) {
        return goNext()
      }
      if (response && response.status >= 500) {
        Toast.error(error.message)
        return next(false)
      }
      let hasLoginHistory = localConfig.HAS_LOGIN_HISTORY.get()
      next({
        path: hasLoginHistory ? '/login' : '/register',
        replace: true,
      })
    }
    const goNext = () => next()
    if (loginRequired) {
      userStore
        .login()
        .then(goNext)
        .catch(goLogin)
    } else {
      userStore
        .login()
        .then(() => {
          const isAuthPage = to.name === 'Login' || to.name === 'Register' || to.name === 'Hello'
          if (isAuthPage) {
            next({
              path: '/',
              replace: true,
            })
          } else {
            goNext()
          }
        })
        .catch(goNext)
    }
  })

  return router
}
