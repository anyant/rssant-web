import HomePage from '@/pages/HomePage'
import FeedPage from '@/pages/FeedPage'
import StoryPage from '@/pages/StoryPage'
import FeedDetailPage from '@/pages/FeedDetailPage'

export default [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/feed/:feedId',
    name: 'Feed',
    component: FeedPage
  },
  {
    path: '/story/:storyId',
    name: 'Story',
    component: StoryPage
  },
  {
    path: '/feed/:feedId/detail',
    name: 'FeedDetail',
    component: FeedDetailPage
  },
]
