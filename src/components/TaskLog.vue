<template>
  <mu-stepper orientation="vertical" :linear="false">
    <mu-step v-for="(item, i) in logs" :key="i" :icon-color="getColor(item)">
      <mu-step-label>
        {{ item.dt }}
      </mu-step-label>
      <mu-step-content>
        <pre>{{ item.message }}</pre>
      </mu-step-content>
    </mu-step>
  </mu-stepper>
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

<style>
</style>
