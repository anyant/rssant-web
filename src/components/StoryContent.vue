<template>
  <div class="content" v-html="content"></div>
</template>

<script>
export default {
  props: {
    content: {
      type: String
    }
  }
}
</script>

<style>
img {
  max-width: 100%;
}
</style>
