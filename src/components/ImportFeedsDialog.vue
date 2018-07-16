<template>
  <mu-dialog :open="isOpen" title="从文件批量导入供稿地址" @close="close" width="500">
    <input type="file" label="选择文件">
    <mu-button flat slot="actions" color="primary" @click="handleSave" :disabled="saveDisabled">确定</mu-button>
    <mu-button flat slot="actions" @click="close">取消</mu-button>
  </mu-dialog>
</template>

<script>
export default {
  data() {
    return {
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
