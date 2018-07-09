<template>
  <GoBackLayout previous="TaskList" title="Task Logs">
    <Task v-if="task" :task="task" :fetch-log="fetchLog"></Task>
  </GoBackLayout>
</template>

<script>
import { GoBackLayout } from '@/layouts'
import { Task } from '@/components/Task'

export default {
  components: { GoBackLayout, Task },
  data() {
    return {
      task: null
    }
  },
  computed: {
    taskId() {
      return this.$route.params.taskId
    }
  },
  methods: {
    async fetchTask() {
      let task = await this.$api.get('/task/get', {
        params: { task_id: this.taskId }
      })
      this.task = task
    },
    async fetchLog({ taskId, numRun }) {
      let log = await this.$api.get('/task/log', {
        params: {
          task_id: taskId,
          num_run: numRun
        }
      })
      return log
    }
  },
  async afterLogin() {
    await this.fetchTask()
  }
}
</script>

<style>
</style>
