<template>
  <div v-if="task">
    <mu-sub-header class="task-info">
      <div>
        <mu-badge color="primary" content="ID：" />
        <code>{{ task.id }}</code>
      </div>
      <div>
        <mu-badge color="primary" content="状态：" />
        <TaskStatus :state="task.state"></TaskStatus>
      </div>
      <div>
        <mu-badge color="primary" content="名称：" />
        <code>{{ task.name }}</code>
      </div>
      <div>
        <mu-badge color="primary" content="更新时间：" />
        <code>{{ task.dtu }}</code>
      </div>
      <div>
        <mu-badge color="primary" content="参数：" />
        <code>{{ task.args }}</code>
        <pre>{{ task.kwargs }}</pre>
      </div>
    </mu-sub-header>
    <TaskLog></TaskLog>
  </div>
</template>

<script>
import TaskLog from '@/components/TaskLog'
import TaskStatus from '@/components/TaskStatus'

export default {
  components: { TaskLog, TaskStatus },
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
