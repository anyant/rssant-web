<template>
  <div class="markdown-body" v-html="content"></div>
</template>

<script>
import 'github-markdown-css'

export default {
  props: {
    content: {
      type: String
    }
  }
}
</script>

<style>
</style>
