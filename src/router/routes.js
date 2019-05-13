import MoHomePage from '@/views/MoHomePage'
import MoMushroomsPage from '@/views/MoMushroomsPage'
import MoGardenPage from '@/views/MoGardenPage'
import MoJunglePage from '@/views/MoJunglePage'
import MoDesertPage from '@/views/MoDesertPage'
import MoTrashPage from '@/views/MoTrashPage'
import MoStoryListPage from '@/views/MoStoryListPage'
import MoLoginPage from '@/views/MoLoginPage'
import MoRegisterPage from '@/views/MoRegisterPage'
import MoFeedCreationPage from '@/views/MoFeedCreationPage'
import MoStoryPage from '@/views/MoStoryPage'
import MoFeedDetailPage from '@/views/MoFeedDetailPage'

import NotFoundPage from '@/views/NotFoundPage'

export default [
  {
    path: '/',
    name: 'Home',
    component: MoHomePage,
    meta: { loginRequired: true },
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
    path: '/feed-creation',
    name: 'FeedCreation',
    component: MoFeedCreationPage,
    meta: { loginRequired: true },
  },
  {
    path: '/mushrooms',
    name: 'Mushrooms',
    component: MoMushroomsPage,
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
    path: '/desert',
    name: 'Desert',
    component: MoDesertPage,
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
  { path: '*', component: NotFoundPage }
]
