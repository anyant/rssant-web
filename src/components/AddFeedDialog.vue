<template>
  <mu-dialog v-if="isOpen" :open="isOpen" @close="onClose" width="500">
    <template v-slot:title>添加新订阅</template>
    <mu-text-field
      ref="feedUrl"
      v-model="feedUrl"
      label="请填入你想要订阅的供稿地址"
      label-float
      full-width
      :error-text="errorText"
      @focus="onFocus"
      @keyup.enter.native="onSave"
    />
    <mu-button class="button-save" color="primary" @click="onSave" :disabled="isSaveDisabled">确定</mu-button>
    <div class="import-wrapper">
      <label for="import-feed-file" class="import-feed-label">从文件导入:</label>
      <form style="display: none;" ref="importFeedForm">
        <input
          type="file"
          name="import-feed-file"
          ref="importFeedFile"
          style="display: none;"
          @change="onImportFileChange"
        >
      </form>
      <mu-button
        class="button-import"
        color="success"
        flat
        @click="onImportClick('OPML')"
        v-loading="importOPMLLoading"
        data-mu-loading-size="24"
      >XML/OPML</mu-button>
      <mu-button
        class="button-import"
        color="success"
        flat
        @click="onImportClick('Bookmark')"
        v-loading="importBookmarkLoading"
        data-mu-loading-size="24"
      >浏览器书签</mu-button>
    </div>
  </mu-dialog>
</template>

<script>
/**
 * API:
 *    close()
 *    open()
 */
import Vue from 'vue'
import lodash from 'lodash'

const signal = new Vue()

export const API = {
  open() {
    signal.$emit('open')
  },
  close() {
    signal.$emit('close')
  }
}

export default {
  data() {
    return {
      signal: signal,
      isOpen: false,
      feedUrl: null,
      errorText: null,
      importFile: null,
      importFileTarget: null,
      importOPMLLoading: false,
      importBookmarkLoading: false
    }
  },
  computed: {
    isSaveDisabled() {
      return !this.feedUrl
    }
  },
  created() {
    this.signal.$on('close', this.onClose)
    this.signal.$on('open', this.onOpen)
  },
  methods: {
    focusInput() {
      // https://github.com/museui/muse-ui/issues/219
      this.$nextTick(() => {
        if (this.$refs.feedUrl) {
          let el = this.$refs.feedUrl.$el
          el.querySelector('input').focus()
        }
      })
    },
    onOpen() {
      this.isOpen = true
      setTimeout(() => {
        this.onFocus()
      }, 300)
    },
    onClose() {
      this.isOpen = false
    },
    async onSave() {
      if (this.isSaveDisabled) {
        return
      }
      try {
        await this.$StoreAPI.feed.createFeed({ url: this.feedUrl })
        this.onClose()
        this.feedUrl = null
      } catch (error) {
        this.errorText = error.message
      }
    },
    onFocus() {
      this.errorText = null
      this.focusInput()
    },
    onImportClick(target) {
      let el = this.$refs.importFeedFile
      if (!lodash.isNil(el)) {
        this.importFileTarget = target
        el.click()
      } else {
        this.importFileTarget = null
      }
    },
    onImportFileChange() {
      let el = this.$refs.importFeedFile
      if (lodash.isNil(el) || el.files.length <= 0) {
        return
      }
      let file = el.files[0]
      try {
        if (this.importFileTarget === 'OPML') {
          this.onImportOPML(file)
        } else if (this.importFileTarget === 'Bookmark') {
          this.onImportBookmark(file)
        } else {
          this.importFileTarget = null
        }
      } finally {
        let form = this.$refs.importFeedForm
        form.reset()
      }
    },
    onImportOPML(file) {
      this.importOPMLLoading = true
      this.$StoreAPI.feed
        .importOPML({ file })
        .then(() => {
          this.$message.success('导入XML/OPML文件成功')
          this.onClose()
        })
        .catch(error => {
          this.$message.error({
            message: '导入XML/OPML文件失败: ' + error.message,
            duration: 10000
          })
        })
        .finally(() => {
          this.importOPMLLoading = false
        })
    },
    onImportBookmark(file) {
      this.importBookmarkLoading = true
      this.$StoreAPI.feed
        .importBookmark({ file })
        .then(() => {
          this.$message.success('导入书签文件成功')
          this.onClose()
        })
        .catch(error => {
          this.$message.error({
            message: '导入书签文件失败: ' + error.message,
            duration: 10000
          })
        })
        .finally(() => {
          this.importBookmarkLoading = false
        })
    }
  }
}
</script>

<style lang="less" scoped>
.button-save.disabled {
  background-color: lighten(#2196f3, 20%);
  color: #f3f3f3;
}
.import-wrapper {
  margin-top: 42px;
  margin-bottom: 8px;
}
.import-feed-label {
  display: inline-block;
  font-size: 14px;
  color: #9b9b9b;
  vertical-align: middle;
}
.button-import {
  margin-left: 16px;
  border: solid 1px #e6e6e6;
}
</style>
