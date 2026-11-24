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
      <MoGroupNameSelectorDialog
        :open.sync="openGroupDialog"
        :value="groupName"
        @confirm="onSelectGroup"
      ></MoGroupNameSelectorDialog>
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
        <div
          class="button-text-wrapper"
          :class="{ 'button-disabled': isSaveDisabled, 'button-loading': isImportLoading }"
        >
          <MoFeedCreationGroupButton :group="groupName" @click="()=>this.openGroupDialog=true" />
          <mu-button
            class="button-text-save"
            :color="antBlue"
            @click="onSave"
            :disabled="isSaveDisabled"
            data-mu-loading-size="24"
            v-loading="isImportLoading"
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
        <div class="button-file-wrapper" :class="{ 'button-loading': isImportLoading }">
          <MoFeedCreationGroupButton :group="groupName" @click="()=>this.openGroupDialog=true" />
          <mu-button
            class="button-file-import"
            :color="antBlue"
            @click="onImportClick"
            data-mu-loading-size="24"
            v-loading="isImportLoading"
          >导入文件</mu-button>
        </div>
      </div>
      <router-link class="discover-entry" to="/discover">
        不知道订什么？去发现订阅源
        <fa-icon icon="chevron-right" :size="12" />
      </router-link>
      <MoCreationList ref="creationListRef" class="creation-list"></MoCreationList>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import MoCreationList from '@/components/MoCreationList'
import MoGroupNameSelectorDialog from '@/components/MoGroupNameSelectorDialog.vue'
import MoFeedCreationGroupButton from '@/components/MoFeedCreationGroupButton.vue'

import { antBlue } from '@/plugin/common'
import { getGroupId } from '../plugin/feedGroupHelper'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'

export default {
  name: 'MoFeedCreationPage',
  components: { MoLayout, MoBackHeader, MoCreationList, MoGroupNameSelectorDialog, MoFeedCreationGroupButton },
  props: {
    vid: {
      type: String,
      default: '/feed-creation',
    },
  },
  data() {
    return {
      antBlue,
      isFromText: true,
      inputText: null,
      errorText: null,
      importFile: null,
      importFileTarget: null,
      isImportLoading: false,
      openGroupDialog: false,
      groupName: null,
    }
  },
  computed: {
    isSaveDisabled() {
      return !this.inputText
    },
    groupId() {
      return getGroupId(this.groupName)
    },
  },
  mounted() {
    rootStore.syncFeedLoadMushrooms().then(() => {
      if (feedStore.isEmpty) {
        let changelogUrl = location.origin + '/changelog'
        this.$alert('🎉🎉欢迎！我们先订阅一下蚁阅更新日志吧，我帮你填上链接。', {
          okLabel: '好的',
        }).then(() => {
          this.inputText = changelogUrl
        })
      }
    })
    this.$pageState.restoreScrollTop({ el: this.$refs.creationListRef })
  },
  activated() {
    this.$pageState.restoreScrollTop({ el: this.$refs.creationListRef })
  },
  savePageState() {
    if (this.$pageState.saveScrollTop({ el: this.$refs.creationListRef })) {
      this.$pageState.commit()
    }
  },
  methods: {
    onSelectGroup({ value, done }) {
      this.groupName = value
      done()
    },
    toggleMode() {
      this.isFromText = !this.isFromText
    },
    handleFeedImportedResult({ isImport, numFeedCreations, numCreatedFeeds, numExistedFeeds, firstExistedFeed }) {
      if (numFeedCreations <= 0 && numCreatedFeeds <= 0) {
        let message = ''
        if (numExistedFeeds <= 0) {
          message = '未找到任何订阅'
        } else if (numExistedFeeds === 1 && !isImport) {
          if (_.isNil(firstExistedFeed)) {
            message = '订阅已存在'
          } else {
            message = `订阅 #${firstExistedFeed.id} 已存在: ${firstExistedFeed.title}`
          }
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
      if (this.isSaveDisabled || this.isImportLoading) {
        return
      }
      this.isImportLoading = true
      feedStore
        .import({ text: this.inputText, group: this.groupId })
        .then(this.onFeedSavedResult.bind(this))
        .catch(error => {
          this.errorText = error.message
        })
        .finally(() => {
          this.isImportLoading = false
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
      if (this.isImportLoading) {
        return
      }
      this.isImportLoading = true
      feedStore
        .importFile({ file, group: this.groupId })
        .then(this.onFeedImportedResult.bind(this))
        .catch(error => {
          this.$toast.error({
            message: '导入文件失败: ' + error.message,
            time: 10000,
          })
        })
        .finally(() => {
          this.isImportLoading = false
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

.button-disabled {
  .feed-creation-group-button {
    border-color: mix(@antBlue, @antBackWhite, 80%);
  }
  .button-text-save {
    background: mix(@antBlue, @antBackWhite, 80%);
    color: @antTextWhite;
  }
}

.button-loading {
  .feed-creation-group-button {
    opacity: 0.2;
  }
}

.import-file-info {
  color: @antTextGrey;
  text-align: center;
  font-size: 15 * @pr;
  span {
    display: block;
  }
}

.discover-entry {
  position: absolute;
  top: 196 * @pr;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4 * @pr;
  height: 32 * @pr;
  color: #2e7d32;
  font-size: 13 * @pr;
  text-decoration: none;
}

.creation-list {
  position: absolute;
  left: 0;
  right: 0;
  top: 244 * @pr;
  bottom: 0;
  overflow-y: auto;
  padding-bottom: 8 * @pr;
  border-top: solid 1px @antBackGrey;
}
</style>