<template>
  <MoLayout header>
    <MoBackHeader border>
      <template v-slot:title>添加新订阅</template>
    </MoBackHeader>
    <div class="main">
      <mu-text-field
        class="feed-url"
        ref="feedUrl"
        v-model="feedUrl"
        placeholder="请填入你想要订阅的网址"
        full-width
        :error-text="errorText"
        @focus="onFocus"
        @keyup.enter.native="onSave"
      />
      <div class="button-wrapper">
        <mu-button
          class="button-save"
          :color="antBlue"
          @click="onSave"
          :disabled="isSaveDisabled"
        >确定</mu-button>
      </div>
      <label for="import-feed-file" class="import-feed-label">或从文件导入</label>
      <form style="display: none;" ref="importFeedForm">
        <input
          type="file"
          name="import-feed-file"
          ref="importFeedFile"
          style="display: none;"
          @change="onImportFileChange"
        >
      </form>
      <div class="import-wrapper">
        <MoAntGreenButton
          class="import-opml"
          @click="onImportClick('OPML')"
          v-loading="importOPMLLoading"
        >XML/OPML</MoAntGreenButton>
        <MoAntGreenButton
          class="import-bookmark"
          @click="onImportClick('Bookmark')"
          v-loading="importBookmarkLoading"
        >浏览器书签</MoAntGreenButton>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader.vue'
import MoAntGreenButton from '@/components/MoAntGreenButton.vue'
import { antBlue } from '@/plugin/common'

export default {
  components: { MoLayout, MoBackHeader, MoAntGreenButton },
  data() {
    return {
      antBlue,
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
  methods: {
    onSave() {
      if (this.isSaveDisabled) {
        return
      }
      this.$API.feed
        .create({ url: this.feedUrl })
        .then(is_ready => {
          this.feedUrl = null
          if (is_ready) {
            this.$toast.success('添加成功')
          } else {
            this.$toast.info('已加入查找队列，稍后即可阅读')
          }
          this.$router.back()
        })
        .catch(error => {
          this.errorText = error.message
        })
    },
    onFocus() {
      this.errorText = null
    },
    onImportClick(target) {
      let el = this.$refs.importFeedFile
      if (!_.isNil(el)) {
        this.importFileTarget = target
        el.click()
      } else {
        this.importFileTarget = null
      }
    },
    onImportFileChange() {
      let el = this.$refs.importFeedFile
      if (_.isNil(el) || el.files.length <= 0) {
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
      this.$API.feed
        .importOPML({ file })
        .then(() => {
          this.$toast.success('导入XML/OPML文件成功')
          this.$router.back()
        })
        .catch(error => {
          this.$toast.error({
            message: '导入XML/OPML文件失败: ' + error.message,
            time: 10000
          })
        })
        .finally(() => {
          this.importOPMLLoading = false
        })
    },
    onImportBookmark(file) {
      this.importBookmarkLoading = true
      this.$API.feed
        .importBookmark({ file })
        .then(() => {
          this.$toast.success('导入书签文件成功')
          this.$router.back()
        })
        .catch(error => {
          this.$toast.error({
            message: '导入书签文件失败: ' + error.message,
            time: 10000
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
@import '~@/styles/common';

.main {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
}

.feed-url {
  margin-top: 64 * @pr;
}

.button-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.button-save {
  width: 152 * @pr;
  height: 40 * @pr;
  font-size: 18 * @pr;
  font-weight: bold;
  box-shadow: none;
}

.button-save.disabled {
  background: lighten(@antBlue, 10%);
  color: #fff;
  opacity: 0.8;
}

.import-feed-label {
  display: block;
  margin-top: 80 * @pr;
  margin-bottom: 16 * @pr;
  font-size: 14 * @pr;
  color: @antTextLight;
  text-align: center;
}

.import-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.import-opml,
.import-bookmark {
  width: 124 * @pr;
}

.import-bookmark {
  margin-left: 24 * @pr;
}
</style>