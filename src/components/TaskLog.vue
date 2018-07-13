<template>
  <div class="logs">
    <div class="log" v-for="(item, i) in logs" :key="i">
      <mu-badge :content="item.level" :color="getColor(item)"></mu-badge>
      <span class="log-dt">{{ item.dt }}</span>
      <pre class="log-message">{{ item.message }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    logs() {
      return this.$store.getters.currentTaskLogs
    }
  },
  methods: {
    getColor(logItem) {
      return (
        {
          debug: 'green',
          info: 'black',
          warn: 'orange',
          warning: 'orange',
          error: 'red'
        }[logItem.level] || 'black'
      )
    }
  }
}
</script>

<style lang="less" scoped>
.logs {
  padding-left: 16px;
  line-height: 24px;
}

.log-dt {
  color: #666;
  margin-left: 8px;
}

.log-message {
  padding-left: 16px;
}
</style>
