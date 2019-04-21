import MoHomePage from '@/views/MoHomePage'
import MoFeedMushroomPage from '@/views/MoFeedMushroomPage'
import MoFeedLeavesPage from '@/views/MoFeedLeavesPage'
import MoStoryListPage from '@/views/MoStoryListPage'
import MoLoginPage from '@/views/MoLoginPage'
import MoRegisterPage from '@/views/MoRegisterPage'
import MoFeedCreationPage from '@/views/MoFeedCreationPage'
import MoStoryPage from '@/views/MoStoryPage'

import FeedDetailPage from '@/views/FeedDetailPage'
import NotFoundPage from '@/views/NotFoundPage'

export default [
  {
    path: '/',
    name: 'Home',
    component: MoHomePage,
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
  },
  {
    path: '/mushroom',
    name: 'FeedMushroom',
    component: MoFeedMushroomPage,
  },
  {
    path: '/leaves',
    name: 'FeedLeaves',
    component: MoFeedLeavesPage,
  },
  {
    path: '/feed/:feedId',
    name: 'StoryList',
    component: MoStoryListPage,
  },
  {
    path: '/story/:storyId',
    name: 'Story',
    component: MoStoryPage
  },
  {
    path: '/feed/:feedId/detail',
    name: 'FeedDetail',
    component: FeedDetailPage
  },
  { path: '*', component: NotFoundPage }
]
