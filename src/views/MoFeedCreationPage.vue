<template>
  <div>
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
        <MoAntGreenButton class="import-opml">XML/OPML</MoAntGreenButton>
        <MoAntGreenButton class="import-bookmark">浏览器书签</MoAntGreenButton>
      </div>
    </div>
  </div>
</template>

<script>
import MoBackHeader from '@/components/MoBackHeader.vue'
import MoAntGreenButton from '@/components/MoAntGreenButton.vue'
import { antBlue } from '@/plugin/common'

export default {
  components: { MoBackHeader, MoAntGreenButton },
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
    async onSave() {
      if (this.isSaveDisabled) {
        return
      }
      this.errorText = '创建失败'
    },
    onFocus() {
      this.errorText = null
    },
    onImportFileChange() {}
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.header,
.main {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  background: #ffffff;
}

.main {
  position: absolute;
  width: 100%;
  top: 48 * @pr;
  bottom: 0;
}

.feed-url {
  margin-top: 66 * @pr;
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
  color: @antTextWhiteGrey;
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