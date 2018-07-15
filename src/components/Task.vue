<template>
  <div v-if="task">
    <mu-sub-header class="task-info">
      <div>
        <mu-badge color="primary" content="ID：" />
        <code>{{ task.id }}</code>
      </div>
      <div>
        <mu-badge color="primary" content="状态：" />
        <TaskState :state="task.state"></TaskState>
      </div>
      <div>
        <mu-badge color="primary" content="名称：" />
        <code>{{ task.name }}</code>
      </div>
      <div>
        <mu-badge color="primary" content="更新时间：" />
        <code>{{ task.dtu }}</code>
      </div>
    </mu-sub-header>
    <TaskLog></TaskLog>
  </div>
</template>

<script>
import TaskLog from '@/components/TaskLog'
import TaskState from '@/components/TaskState'

export default {
  components: { TaskLog, TaskState },
  computed: {
    task() {
      return this.$store.getters.currentTask
    }
  }
}
</script>

<style lang="less">
.task-info {
  line-height: 32px;
  margin-top: 16px;
  margin-bottom: 24px;
}
</style>
