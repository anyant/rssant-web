import StoryPage from '@/pages/StoryPage'
import StoryListPage from '@/pages/StoryListPage'
import UserPage from '@/pages/UserPage'
import TaskListPage from '@/pages/TaskListPage'
import TaskPage from '@/pages/TaskPage'
import FeedListPage from '@/pages/FeedListPage'
import FeedPage from '@/pages/FeedPage'

export default [{
    path: '/story/:storyId',
    name: 'Story',
    component: StoryPage
  },
  {
    path: '/',
    name: 'StoryList',
    component: StoryListPage
  },
  {
    path: '/u/:userId',
    name: 'User',
    component: UserPage
  },
  {
    path: '/task/',
    name: 'TaskList',
    component: TaskListPage
  },
  {
    path: '/task/:taskId',
    name: 'Task',
    component: TaskPage,
    autoLogin: true
  },
  {
    path: '/feed/',
    name: 'FeedList',
    component: FeedListPage
  },
  {
    path: '/feed/:feedId',
    name: 'Feed',
    component: FeedPage,
    autoLogin: true
  }
]
