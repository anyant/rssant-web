<template>
  <mu-badge :content="state" :color="color"></mu-badge>
</template>

<script>
import * as lodash from 'lodash-es'

export default {
  props: {
    state: {
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
      }[this.state]
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
