<template>
  <mu-dialog :open="isOpen" title="添加新订阅" @close="close" width="500">
    <mu-text-field ref="feedUrl" v-model="feedUrl" label="请填入你想要订阅的供稿地址" label-float fullWidth :errorText="errorText" @focus="handleInputFocus" @keyup.enter.native="handleSave" />
    <input name='import-feeds' type="file">
    <button type="button" @click="handleImportFeeds">批量导入</button>
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
  watch: {
    isOpen: function(val) {
      if (val) {
        setTimeout(() => {
          this.focus()
        }, 300)
      }
    }
  },
  methods: {
    close() {
      this.$store.commit('closeAddFeedDialog')
    },
    focus() {
      // https://github.com/museui/muse-ui/issues/219
      this.$nextTick(() => {
        if (this.$refs.feedUrl) {
          let el = this.$refs.feedUrl.$el
          el.querySelector('input').focus()
        }
      })
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
    },
    handleImportFeeds() {
      let data = new FormData()
      let input = document.getElementsByName('import-feeds')[0]
      if (input.files.length <= 0) {
        return
      }
      data.append('file', input.files[0])
      let config = {
        onUploadProgress: function(progressEvent) {
          let percentCompleted = Math.round(progressEvent.loaded * 100 / progressEvent.total)
          console.log(percentCompleted)
        }
      }
      this.$api
        .post('/rss/import_feeds', data, config)
        .then(res => {
          console.log(res)
          this.close()
          for (let feed of res.data) {
            this.commit('AddFeed', feed)
          }
        })
        .catch(err => {
          this.errorText = err.message
        })
    }
  }
}
</script>

<style>
</style>
