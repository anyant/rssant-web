<template>
  <MoLayout header>
    <MoBackHeader>
      <template v-slot:title>添加新订阅</template>
      <mu-button
        flat
        :color="antBlue"
        class="action-toggle"
        @click="toggleMode"
      >{{ isFromText?'导入文件':'输入链接' }}</mu-button>
    </MoBackHeader>
    <div class="main">
      <transition name="fade">
        <div class="workspace workspace-text" v-if="isFromText" key="workspace-text">
          <mu-text-field
            class="input-text"
            ref="inputText"
            v-model="inputText"
            placeholder="请输入链接或含有链接的文本"
            full-width
            multi-line
            :rows="1"
            :rows-max="2"
            :error-text="errorText"
            @focus="onFocus"
          />
          <div class="button-text-wrapper">
            <mu-button
              class="button-text-save"
              :color="antBlue"
              @click="onSave"
              :disabled="isSaveDisabled"
            >确定</mu-button>
          </div>
        </div>
        <div class="workspace workspace-file" v-else key="workspace-file">
          <div class="import-file-info">
            <span>支持 XML/OPML/HTML</span>
            <span>或任意格式含有链接的文本文件</span>
          </div>
          <form style="display: none;" ref="importFeedForm">
            <input
              type="file"
              name="import-file-input"
              ref="importFileInput"
              style="display: none;"
              @change="onImportFileChange"
            />
          </form>
          <div class="button-file-wrapper">
            <mu-button
              class="button-file-import"
              :color="antBlue"
              flat
              data-mu-loading-size="24"
              @click="onImportClick"
              v-loading="importFileLoading"
            >导入文件</mu-button>
          </div>
        </div>
      </transition>
      <MoCreationList class="creation-list"></MoCreationList>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import MoCreationList from '@/components/MoCreationList'

import { antBlue } from '@/plugin/common'

export default {
  name: 'MoFeedCreationPage',
  components: { MoLayout, MoBackHeader, MoCreationList },
  data() {
    return {
      antBlue,
      isFromText: true,
      inputText: null,
      errorText: null,
      importFile: null,
      importFileTarget: null,
      importFileLoading: false,
    }
  },
  computed: {
    isSaveDisabled() {
      return !this.inputText
    },
  },
  mounted() {
    this.$API.syncFeedLoadMushrooms().then(() => {
      if (this.$API.feed.isEmpty) {
        let changelogUrl = location.origin + '/changelog'
        this.$alert('🎉🎉欢迎！我们先订阅一下蚁阅更新日志吧，我帮你填上链接。', {
          okLabel: '好的',
        }).then(() => {
          this.inputText = changelogUrl
        })
      }
    })
    window.scrollTo(0, 0)
  },
  methods: {
    toggleMode() {
      this.isFromText = !this.isFromText
    },
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
      this.inputText = null
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
        .import({ text: this.inputText })
        .then(this.onFeedSavedResult.bind(this))
        .catch(error => {
          this.errorText = error.message
        })
    },
    onFocus() {
      this.errorText = null
    },
    onImportClick() {
      let el = this.$refs.importFileInput
      if (!_.isNil(el)) {
        el.click()
      }
    },
    onImportFileChange() {
      let el = this.$refs.importFileInput
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

.action-toggle {
  font-size: 15 * @pr;
  margin-right: -12 * @pr;
}

.action-toggle /deep/ .mu-button-wrapper {
  padding-left: 12 * @pr;
  padding-right: 12 * @pr;
}

.layout {
  position: relative;
}

.workspace {
  position: absolute;
  z-index: 9;
  left: 0;
  right: 0;
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  background: #ffffff;
}

.workspace-text {
  margin-top: 32 * @pr;
}

.workspace-file {
  margin-top: 26 * @pr;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.input-text {
  margin-bottom: 12 * @pr;
}

.button-text-wrapper,
.button-file-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-file-wrapper {
  margin-top: 22 * @pr;
}

.button-text-save,
.button-file-import {
  width: 152 * @pr;
  height: 40 * @pr;
  font-size: 18 * @pr;
  font-weight: bold;
  box-shadow: none;
}

.button-file-import {
  border: solid 1px @antBlue;
}

.button-text-save.disabled {
  background: @antBlue;
  color: #ffffff;
  opacity: 0.8;
}

.import-file-info {
  color: @antTextGrey;
  text-align: center;
  font-size: 15 * @pr;
  span {
    display: block;
  }
}

.creation-list {
  position: absolute;
  left: 0;
  right: 0;
  top: (48 + 140 + 32) * @pr;
  bottom: 0;
  overflow-y: scroll;
  padding-bottom: 8 * @pr;
  border-top: solid 1px @antLineGrey;
}
</style>