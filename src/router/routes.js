import MoHomeV2Page from '@/views/MoHomeV2Page'
import MoMushroomsPage from '@/views/MoMushroomsPage'
import MoFavoritedPage from '@/views/MoFavoritedPage'
import MoCreationDetailPage from '@/views/MoCreationDetailPage'
import MoGardenPage from '@/views/MoGardenPage'
import MoJunglePage from '@/views/MoJunglePage'
import MoTrashPage from '@/views/MoTrashPage'
import MoStoryListPage from '@/views/MoStoryListPage'
import MoLoginPage from '@/views/MoLoginPage'
import MoRegisterPage from '@/views/MoRegisterPage'
import MoFeedCreationPage from '@/views/MoFeedCreationPage'
import MoFeedCleanPage from '@/views/MoFeedCleanPage'
import MoStoryPage from '@/views/MoStoryPage'
import MoFeedDetailPage from '@/views/MoFeedDetailPage'
import MoAccountConfirmEmailPage from '@/views/MoAccountConfirmEmailPage'
import MoResetPasswordPage from '@/views/MoResetPasswordPage'
import MoResetPasswordConfirmPage from '@/views/MoResetPasswordConfirmPage'
import MoAccountPage from '@/views/MoAccountPage'
import MoAboutPage from '@/views/MoAboutPage'

import MoNotFoundPage from '@/views/MoNotFoundPage'

export default [
  {
    path: '/',
    name: 'Home',
    component: MoHomeV2Page,
    meta: { loginRequired: true },
  },
  {
    path: '/about',
    name: 'About',
    component: MoAboutPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: MoLoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: MoRegisterPage,
  },
  {
    path: '/account-confirm-email/:key',
    name: 'AccountConfirmEmail',
    component: MoAccountConfirmEmailPage,
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: MoResetPasswordPage,
  },
  {
    path: '/reset-password/:uid',
    name: 'ResetPasswordConfirm',
    component: MoResetPasswordConfirmPage,
  },
  {
    path: '/account',
    name: 'Account',
    component: MoAccountPage,
    meta: { loginRequired: true },
  },
  {
    path: '/feed-creation',
    name: 'FeedCreation',
    component: MoFeedCreationPage,
    meta: { loginRequired: true },
  },
  {
    path: '/feed-clean',
    name: 'FeedClean',
    component: MoFeedCleanPage,
    meta: { loginRequired: true },
  },
  {
    path: '/mushrooms',
    name: 'Mushrooms',
    component: MoMushroomsPage,
    meta: { loginRequired: true },
  },
  {
    path: '/favorited',
    name: 'Favorited',
    component: MoFavoritedPage,
    meta: { loginRequired: true },
  },
  {
    path: '/creation/:creationId',
    name: 'CreationDetail',
    component: MoCreationDetailPage,
    meta: { loginRequired: true },
  },
  {
    path: '/garden',
    name: 'Garden',
    component: MoGardenPage,
    meta: { loginRequired: true },
  },
  {
    path: '/jungle',
    name: 'Jungle',
    component: MoJunglePage,
    meta: { loginRequired: true },
  },
  {
    path: '/trash',
    name: 'Trash',
    component: MoTrashPage,
    meta: { loginRequired: true },
  },
  {
    path: '/feed/:feedId',
    name: 'StoryList',
    component: MoStoryListPage,
    meta: { loginRequired: true },
  },
  {
    path: '/story/:feedId-:offset',
    name: 'Story',
    component: MoStoryPage,
    meta: { loginRequired: true },
  },
  {
    path: '/feed/:feedId/detail',
    name: 'FeedDetail',
    component: MoFeedDetailPage,
    meta: { loginRequired: true },
  },
  { path: '*', component: MoNotFoundPage },
]
