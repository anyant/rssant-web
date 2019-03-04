import HomePage from '@/views/HomePage'
import FeedPage from '@/views/FeedPage'
import StoryPage from '@/views/StoryPage'
import FeedDetailPage from '@/views/FeedDetailPage'
import NotFoundPage from '@/views/NotFoundPage'

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
  { path: '*', component: NotFoundPage }
]
