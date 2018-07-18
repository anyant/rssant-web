<template>
  <mu-badge :content="status" :color="color"></mu-badge>
</template>

<script>
import * as lodash from 'lodash-es'

export default {
  props: {
    status: {
      type: String,
      required: true
    }
  },
  computed: {
    color() {
      let color = {
        active: 'grey',
        running: 'lime700',
        success: 'success',
        error: 'error'
      }[this.status]
      if (lodash.isNil(color)) {
        color = 'grey'
      }
      return color
    }
  }
}
</script>

<style scoped>
</style>
