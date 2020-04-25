<template>
  <MoLayout header>
    <MoBackHeader>
      <template v-slot:title>添加新订阅</template>
    </MoBackHeader>
    <div class="main">
      <mu-text-field
        class="import-text"
        ref="importText"
        v-model="importText"
        placeholder="请输入链接或含有链接的文本"
        full-width
        multi-line
        :rows="1"
        :rows-max="6"
        :error-text="errorText"
        @focus="onFocus"
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
      <div class="import-feed-info">
        <span>支持XML/OPML, 浏览器书签和HTML</span>
        <span>或任意格式含有链接的文本文件</span>
      </div>
      <form style="display: none;" ref="importFeedForm">
        <input
          type="file"
          name="import-feed-file"
          ref="importFeedFile"
          style="display: none;"
          @change="onImportFileChange"
        />
      </form>
      <div class="import-wrapper">
        <MoAntGreenButton
          class="import-file"
          @click="onImportClick"
          v-loading="importFileLoading"
        >导入文件</MoAntGreenButton>
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
      importText: null,
      errorText: null,
      importFile: null,
      importFileTarget: null,
      importFileLoading: false,
    }
  },
  computed: {
    isSaveDisabled() {
      return !this.importText
    },
  },
  mounted() {
    this.$API.syncFeedLoadMushrooms().then(() => {
      if (this.$API.feed.isEmpty) {
        let changelogUrl = location.origin + '/changelog'
        this.$alert('🎉🎉欢迎！我们先订阅一下蚁阅更新日志，我帮你填上链接。', {
          okLabel: '好的',
        }).then(() => {
          this.importText = changelogUrl
        })
      }
    })
  },
  methods: {
    handleFeedImportedResult({ isImport, numFeedCreations, numCreatedFeeds, numExistedFeeds }) {
      if (numFeedCreations <= 0 && numCreatedFeeds <= 0) {
        let message = ''
        if (numExistedFeeds <= 0) {
          message = '未找到任何订阅'
        } else if (numExistedFeeds === 1 && !isImport) {
          message = '订阅已存在'
        } else {
          message = `共 ${numExistedFeeds} 个订阅均已存在`
        }
        if (isImport) {
          this.$toast.warning({ message: message, time: 10000 })
        } else {
          this.errorText = message
        }
        return
      }
      let importMessage = isImport ? '导入文件成功，' : ''
      this.importText = null
      var message = ''
      if (numFeedCreations <= 0 && numCreatedFeeds > 0) {
        message = `${isImport ? '导入' : '添加'}成功, 找到 ${numCreatedFeeds} 个新订阅`
        if (numExistedFeeds > 0) {
          message = message + `，已存在 ${numExistedFeeds} 个订阅`
        }
        this.$toast.success({ message: importMessage + message, time: 10000 })
      } else if (numFeedCreations > 0 && numCreatedFeeds <= 0) {
        if (numExistedFeeds > 0) {
          message = `已存在 ${numExistedFeeds} 个订阅，还有 ${numFeedCreations} 个链接正在查找中，稍后即可阅读`
        } else {
          message = `共 ${numFeedCreations} 个链接正在查找中，稍后即可阅读`
        }
        this.$toast.success({ message: importMessage + message, time: 10000 })
      } else {
        message = `找到 ${numCreatedFeeds} 个新订阅，还有 ${numFeedCreations} 个链接正在查找中，稍后即可阅读`
        if (numExistedFeeds > 0) {
          message = `已存在 ${numExistedFeeds} 个订阅，` + message
        }
        this.$toast.info({ message: importMessage + message, time: 10000 })
      }
      this.$router.back()
    },
    onFeedSavedResult(result) {
      return this.handleFeedImportedResult({ isImport: false, ...result })
    },
    onFeedImportedResult(result) {
      return this.handleFeedImportedResult({ isImport: true, ...result })
    },
    onSave() {
      if (this.isSaveDisabled) {
        return
      }
      this.$API.feed
        .import({ text: this.importText })
        .then(this.onFeedSavedResult.bind(this))
        .catch(error => {
          this.errorText = error.message
        })
    },
    onFocus() {
      this.errorText = null
    },
    onImportClick() {
      let el = this.$refs.importFeedFile
      if (!_.isNil(el)) {
        el.click()
      }
    },
    onImportFileChange() {
      let el = this.$refs.importFeedFile
      if (_.isNil(el) || el.files.length <= 0) {
        return
      }
      let file = el.files[0]
      try {
        this.onImportFile(file)
      } finally {
        let form = this.$refs.importFeedForm
        form.reset()
      }
    },
    onImportFile(file) {
      this.importFileLoading = true
      this.$API.feed
        .importFile({ file })
        .then(this.onFeedImportedResult.bind(this))
        .catch(error => {
          this.$toast.error({
            message: '导入文件失败: ' + error.message,
            time: 10000,
          })
        })
        .finally(() => {
          this.importFileLoading = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
}

.import-text {
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
  background: @antBlue;
  color: #ffffff;
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

.import-feed-info {
  color: @antTextGrey;
  text-align: center;
  span {
    display: inline-block;
  }
}

.import-file {
  width: 152 * @pr;
  margin-top: 16 * @pr;
}
</style>