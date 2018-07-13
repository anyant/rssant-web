import HomePage from '@/pages/HomePage'
import FeedPage from '@/pages/FeedPage'
import ServerPage from '@/pages/ServerPage'
import StoryPage from '@/pages/StoryPage'

// // import StoryListPage from '@/pages/StoryListPage'
// import UserPage from '@/pages/UserPage'
// import TaskListPage from '@/pages/TaskListPage'
// import TaskPage from '@/pages/TaskPage'



export default [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/server/',
    name: 'Server',
    component: ServerPage
  },
  {
    path: '/feed/:feedId',
    name: 'Feed',
    component: FeedPage,
    autoLogin: true
  },
  {
    path: '/story/:storyId',
    name: 'Story',
    component: StoryPage
  },
  // {
  //   path: '/u/:userId',
  //   name: 'User',
  //   component: UserPage
  // },
  // {
  //   path: '/task/',
  //   name: 'TaskList',
  //   component: TaskListPage
  // },
  // {
  //   path: '/task/:taskId',
  //   name: 'Task',
  //   component: TaskPage,
  //   autoLogin: true
  // },
]
