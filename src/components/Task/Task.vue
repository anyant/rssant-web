<template>
  <div class="rssant-task">
    <mu-sub-header class="task-info">
      <div>
        <mu-badge content="ID:"/>
        <code>{{ task.id }}</code>
      </div>
      <div>
        <mu-badge content="Name:"/>
        <code>{{ task.name }}</code>
      </div>
    </mu-sub-header>
    <mu-tabs v-show="hasMultiTab" :value="activeTab" @change="handleTabChange">
      <mu-tab v-for="t in tabs" :key="t.key" :value="t.value" :title="t.title"/>
    </mu-tabs>
    <mu-content-block class="logs">
      <TaskLog v-if="activeTab == 1" v-for="(log, key) in logs" :key="key" :log="log">
      </TaskLog>
    </mu-content-block>
  </div>
</template>

<script>
import TaskLog from './TaskLog'

export default {
  components: { TaskLog },
  props: {
    task: Object,
    fetchLog: Function
  },
  data() {
    return {
      tabs: [],
      activeTab: 1,
      logs: {}
    }
  },
  computed: {
    hasMultiTab() {
      return this.tabs.length > 1
    }
  },
  created() {
    for (let i = 1; i <= this.task.num_run; i++) {
      this.tabs.push({
        key: i,
        value: i,
        title: `Log ${i}`
      })
    }
  },
  async mounted() {
    await this.handleTabChange(this.activeTab)
  },
  methods: {
    async handleTabChange(value) {
      this.activeTab = value
      let log = await this.fetchLog({
        taskId: this.task.id,
        numRun: value
      })
      this.$set(this.logs, value, log)
    }
  }
}
</script>

<style lang="less">
.rssant-task {
  .task-info {
    line-height: 32px;
    margin-top: 16px;
  }
  .logs {
    margin-top: 24px;
  }
}
</style>
