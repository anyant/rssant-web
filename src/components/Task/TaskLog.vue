<template>
  <mu-timeline>
    <mu-timeline-item v-for="(item, i) in log" :key="i" :icon-color="getColor(item)">
      <span slot="time">{{ item.dt }}</span>
      <pre slot="des">{{ item.message }}</pre>
    </mu-timeline-item>
  </mu-timeline>
</template>

<script>
export default {
  props: {
    log: Array
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
