<template>
  <mu-dialog :open="isOpen" title="添加新订阅" @close="close" width="500">
    <mu-text-field v-model="feedUrl" label="请填入你想要订阅的供稿地址" label-float fullWidth :errorText="errorText" @focus="handleInputFocus" @keyup.enter.native="handleSave" />
    <mu-button flat slot="actions" color="primary" @click="handleSave" :disabled="saveDisabled">确定</mu-button>
    <mu-button flat slot="actions" @click="close">取消</mu-button>
  </mu-dialog>
</template>

<script>
export default {
  data() {
    return {
      feedUrl: null,
      errorText: null
    }
  },
  computed: {
    saveDisabled() {
      return !this.feedUrl
    },
    isOpen() {
      return this.$store.state.rss.isAddFeedDialogOpen
    }
  },
  methods: {
    close() {
      this.$store.commit('closeAddFeedDialog')
    },
    async handleSave() {
      if (this.saveDisabled) {
        return
      }
      try {
        await this.$store.dispatch('createFeed', { url: this.feedUrl })
        this.close()
        this.feedUrl = null
      } catch (e) {
        this.errorText = e.message
      }
    },
    handleInputFocus() {
      this.errorText = null
    }
  }
}
</script>

<style>
</style>
