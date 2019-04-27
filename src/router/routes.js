import MoHomePage from '@/views/MoHomePage'
import MoFeedMushroomPage from '@/views/MoFeedMushroomPage'
import MoFeedLeavesPage from '@/views/MoFeedLeavesPage'
import MoFeedDeadwoodPage from '@/views/MoFeedDeadwoodPage'
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
    path: '/mushroom',
    name: 'FeedMushroom',
    component: MoFeedMushroomPage,
    meta: { loginRequired: true },
  },
  {
    path: '/leaves',
    name: 'FeedLeaves',
    component: MoFeedLeavesPage,
    meta: { loginRequired: true },
  },
  {
    path: '/deadwood',
    name: 'FeedDeadwood',
    component: MoFeedDeadwoodPage,
    meta: { loginRequired: true },
  },
  {
    path: '/feed/:feedId',
    name: 'StoryList',
    component: MoStoryListPage,
    meta: { loginRequired: true },
  },
  {
    path: '/story/:storyId',
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
