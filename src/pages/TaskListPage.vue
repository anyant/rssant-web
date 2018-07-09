<template>
  <HeaderLayout>
    <TaskList :task-list="taskList"></TaskList>
  </HeaderLayout>
</template>
<script>
import { mapGetters } from 'vuex'
import { HeaderLayout } from '@/layouts'
import { TaskList } from '@/components/Task'

export default {
  components: { HeaderLayout, TaskList },
  data() {
    return { taskList: [], taskListFetched: false }
  },
  computed: {
    ...mapGetters(['isLogin'])
  },
  methods: {
    async fetchTaskList() {
      let taskList = await this.$api.get('/task/list')
      taskList.forEach(x => {
        this.taskList.push(x)
      })
      this.taskListFetched = true
    }
  },
  async afterLogin() {
    if (this.isLogin && !this.taskListFetched) {
      await this.fetchTaskList()
    }
  }
}
</script>

<style>
</style>
