import { hasBoard } from '@/plugin/common'
import MoHomePage from '@/views/MoHomePage'
import MoFavoritedPage from '@/views/MoFavoritedPage'
import MoCreationDetailPage from '@/views/MoCreationDetailPage'
import MoStoryListPage from '@/views/MoStoryListPage'
import MoMushroomPage from '@/views/MoMushroomPage'
import MoMushroomDetailPage from '@/views/MoMushroomDetailPage'
import MoFeedGroupPage from '@/views/MoFeedGroupPage'
import MoFeedGroupDetailPage from '@/views/MoFeedGroupDetailPage'
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
import MoHelloPage from '@/views/MoHelloPage'
import MoHelpPage from '@/views/MoHelpPage'
import MoVipPage from '@/views/MoVipPage'
import MoNotFoundPage from '@/views/MoNotFoundPage'

const boardRoutes = [
  {
    path: 'account',
    name: 'Account',
    component: MoAccountPage,
    meta: { loginRequired: true },
  },
  {
    path: 'help',
    name: 'Help',
    component: MoHelpPage,
    meta: { loginRequired: true },
  },
  {
    path: 'vip',
    name: 'Vip',
    component: MoVipPage,
    meta: { loginRequired: true },
  },
  {
    path: 'feed-creation',
    name: 'FeedCreation',
    component: MoFeedCreationPage,
    meta: { loginRequired: true },
  },
  {
    path: 'feed-clean',
    name: 'FeedClean',
    component: MoFeedCleanPage,
    meta: { loginRequired: true },
  },
  {
    path: 'favorited',
    name: 'Favorited',
    component: MoFavoritedPage,
    meta: { loginRequired: true },
  },
  {
    path: 'creation-detail',
    name: 'CreationDetail',
    component: MoCreationDetailPage,
    meta: { loginRequired: true },
  },
  {
    path: 'feed',
    name: 'StoryList',
    component: MoStoryListPage,
    meta: { loginRequired: true },
  },
  {
    path: 'mushroom',
    name: 'Mushroom',
    component: MoMushroomPage,
    meta: { loginRequired: true },
  },
  {
    path: 'mushroom-detail',
    name: 'MushroomDetail',
    component: MoMushroomDetailPage,
    meta: { loginRequired: true },
  },
  {
    path: 'group',
    name: 'FeedGroup',
    component: MoFeedGroupPage,
    meta: { loginRequired: true },
  },
  {
    path: 'group-detail',
    name: 'FeedGroupDetail',
    component: MoFeedGroupDetailPage,
    meta: { loginRequired: true },
  },
  {
    path: 'story',
    name: 'Story',
    component: MoStoryPage,
    meta: { loginRequired: true },
  },
  {
    path: 'feed-detail',
    name: 'FeedDetail',
    component: MoFeedDetailPage,
    meta: { loginRequired: true },
  },
]

const mainRoutes = boardRoutes.map(x => {
  let r = { ...x }
  r.path = '/' + x.path
  return r
})

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MoHomePage,
    meta: { loginRequired: true },
    children: hasBoard ? boardRoutes : [],
  },
  {
    path: '/about',
    name: 'About',
    component: MoAboutPage,
  },
  {
    path: '/hello',
    name: 'Hello',
    component: MoHelloPage,
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
]
if (!hasBoard) {
  mainRoutes.forEach(x => routes.push(x))
}
routes.push({ path: '*', component: MoNotFoundPage })

export default routes
