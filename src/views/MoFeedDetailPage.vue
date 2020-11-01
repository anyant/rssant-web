<template>
  <MoLayout header>
    <MoBackHeader border>
      <template v-slot:title>{{ feedTitle }}</template>
      <mu-button icon class="action-delete" @click="deleteFeed">
        <fa-icon class="action-icon" icon="trash" />
      </mu-button>
    </MoBackHeader>
    <div class="feed-info">
      <div class="item title-item">
        <span class="item-name">标题</span>
        <template v-if="form.isEdit">
          <input class="item-input" v-model="form.title" />
          <span class="item-button item-button-save" @click="onSaveTitle()">
            <fa-icon class="item-button-icon" :color="antBlue" icon="save" />
          </span>
        </template>
        <template v-else>
          <span class="item-value">{{ feedTitle }}</span>
          <span class="item-button item-button-edit" @click="onEditTitle()">
            <fa-icon class="item-button-icon" icon="edit" />
          </span>
        </template>
      </div>
      <div class="item group-item">
        <span class="item-name">品读</span>
        <span class="item-value">
          <mu-radio
            class="group-radio"
            v-model="form.isMushroomGroup"
            :value="true"
            label="是"
            :ripple="false"
            @click="onSaveGroup"
          ></mu-radio>
          <mu-radio
            class="group-radio"
            v-model="form.isMushroomGroup"
            :value="false"
            label="否"
            :ripple="false"
            @click="onSaveGroup"
          ></mu-radio>
        </span>
      </div>
      <div class="item" v-for="item in feedInfo" :key="item.name">
        <span class="item-name">{{ item.name }}</span>
        <a
          v-if="item.type === 'link'"
          class="item-link"
          :href="item.value"
          target="_blank"
        >{{ item.value }}</a>
        <span v-else class="item-value">{{ item.value }}</span>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'
import { formatFullDateFriendly } from '@/plugin/datefmt'
import { antBlue } from '@/plugin/common'

const FEED_FIELDS = [
  {
    name: '状态',
    key: function(feed) {
      return `${_.defaultTo(feed.status, '')} / ${_.defaultTo(feed.response_status, '')}`
    },
    type: 'status',
  },
  {
    name: '主页',
    key: 'link',
    type: 'link',
  },
  {
    name: '简介',
    key: 'description',
  },
  {
    name: '作者',
    key: 'author',
  },
  {
    name: '供稿地址',
    key: 'url',
    type: 'link',
  },
  {
    name: '供稿格式',
    key: 'version',
  },
  {
    name: '异常信息',
    key: 'warnings',
    process: function(value) {
      if (_.isEmpty(value)) {
        return '无'
      }
      return value
    },
  },
  {
    name: '未读故事',
    key: 'num_unread_storys',
    type: 'number',
  },
  {
    name: '故事总数',
    key: 'total_storys',
    type: 'number',
  },
  {
    name: '发布周期',
    key: 'dryness',
    process: function(value) {
      if (_.isNil(value)) {
        return '未知'
      }
      let numStorysPerMonth = 256 / Math.pow(2, (8 * value) / 1000) - 1
      let period = 31 / (numStorysPerMonth + 1)
      if (period >= 1) {
        return `约 ${period.toFixed(0)} 天`
      } else {
        return `小于 1 天`
      }
    },
  },
  {
    name: '干货程度',
    key: 'dryness',
    process: function(value) {
      if (_.isNil(value)) {
        return '未知'
      }
      return `${(value / 10).toFixed(1)}%`
    },
  },
  {
    name: '冻结级别',
    key: 'freeze_level',
    type: 'number',
  },
  {
    name: '使用代理',
    key: 'use_proxy',
    type: 'boolean',
  },
  {
    name: '最老故事发布时间',
    key: 'dt_first_story_published',
    type: 'datetime',
  },
  {
    name: '最新故事发布时间',
    key: 'dt_latest_story_published',
    type: 'datetime',
  },
  {
    name: '创建时间',
    key: 'dt_created',
    type: 'datetime',
  },
  {
    name: '更新时间',
    key: 'dt_updated',
    type: 'datetime',
  },
  {
    name: '检查时间',
    key: 'dt_checked',
    type: 'datetime',
  },
  {
    name: '同步时间',
    key: 'dt_synced',
    type: 'datetime',
  },
]

export default {
  components: { MoBackHeader, MoLayout },
  data() {
    return {
      antBlue,
      form: {
        isEdit: false,
        title: null,
        isMushroomGroup: null,
      },
    }
  },
  async mounted() {
    await this.$API.feed.load({ feedId: this.feedId, detail: true })
    this.form.isMushroomGroup = this.isMushroomGroup
  },
  computed: {
    feedId() {
      return this.$route.params.feedId
    },
    feed() {
      return this.$API.feed.get(this.feedId)
    },
    feedTitle() {
      return _.isNil(this.feed) ? '' : this.feed.title
    },
    isMushroomGroup() {
      return this.$API.feed.isMushroom(this.feed)
    },
    feedInfo() {
      let feed = this.feed
      if (_.isNil(feed)) {
        feed = { id: this.feedId, title: this.feedTitle }
      }
      let info = []
      FEED_FIELDS.forEach(field => {
        let item = {
          name: field.name,
          type: field.type,
        }
        if (_.isFunction(field.key)) {
          item.value = field.key(feed)
        } else {
          item.value = feed[field.key]
        }
        if (!_.isNil(field.process)) {
          item.value = field.process(item.value)
        }
        if (field.type === 'datetime') {
          item.value = formatFullDateFriendly(item.value)
        } else if (field.type === 'boolean') {
          item.value = item.value ? '是' : '否'
        }
        info.push(item)
      })
      return info
    },
  },
  methods: {
    onEditTitle() {
      this.form.title = this.feedTitle
      this.form.isEdit = true
    },
    async onSaveTitle() {
      try {
        await this.$API.feed.setTitle({ feedId: this.feedId, title: this.form.title })
      } catch (ex) {
        this.$toast.error(`更新失败: ${ex.message}`)
      }
      this.form.isEdit = false
    },
    async onSaveGroup() {
      if (_.isNil(this.form.isMushroomGroup)) {
        return
      }
      if (this.form.isMushroomGroup === this.isMushroomGroup) {
        return
      }
      try {
        let group = this.form.isMushroomGroup ? 'SYS:MUSHROOM' : 'SYS:SOLO'
        await this.$API.feed.setGroup({ feedId: this.feedId, group: group })
      } catch (ex) {
        this.$toast.error(`更新失败: ${ex.message}`)
      }
    },
    deleteFeed() {
      this.$confirm(`删除订阅 “${this.feedTitle}” ？`, '提示', {
        type: 'warning',
      }).then(({ result }) => {
        if (result) {
          this.$API.feed
            .delete({ feedId: this.feedId })
            .then(() => {
              this.$toast.success('删除成功')
              this.$router.go(-2)
            })
            .catch(error => {
              this.$toast.message('删除失败: ' + error.message)
            })
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-info {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  padding-bottom: 16 * @pr;
}

.item {
  display: flex;
  align-items: center;
  padding-top: 13 * @pr;
  font-size: 15 * @pr;
}

.title-item {
  padding-top: 20 * @pr;
  min-height: 52 * @pr;

  .item-value,
  .item-input {
    overflow: auto;
    appearance: none;
    outline: none;
    border: none;
    background: none;
    box-shadow: none;
    resize: none;
    display: block;
    padding: 0;
    margin: 0;
  }

  .item-value,
  .item-input {
    width: 100%;
    overflow-y: hidden;
    line-height: 1.1;
    font-size: 15 * @pr;
    color: @antTextSemi;
    vertical-align: middle;
  }
  .item-input {
    height: 24 * @pr;
    border-bottom: 1 * @pr solid @antBlue;
  }

  .item-button {
    padding-right: 8 * @pr;
    padding-left: 8 * @pr;
    cursor: pointer;
  }
  .item-button .item-button-icon {
    display: inline-block;
    width: 24 * @pr;
  }
  .item-button-save {
    margin-right: -4 * @pr;
    .item-button-icon {
      height: 18 * @pr;
    }
  }
  .item-button-edit {
    margin-right: -5 * @pr;
    .item-button-icon {
      height: 16 * @pr;
    }
  }
}

.group-item {
  .item-value {
    display: flex;
  }
  .group-radio {
    margin-right: 40 * @pr;

    /deep/ .mu-radio-icon {
      width: 18 * @pr;
      height: 18 * @pr;
      line-height: 18 * @pr;
    }

    /deep/ .mu-radio-svg-icon {
      width: 18 * @pr;
      height: 18 * @pr;
    }

    /deep/ .mu-radio-label {
      font-size: 15 * @pr;
    }
  }
}

.item-name {
  flex-shrink: 0;
  display: inline-block;
  text-align: right;
  width: 64 * @pr;
  margin-right: 24 * @pr;
  font-size: 15 * @pr;
}

.item-value,
.item-link {
  font-size: 15 * @pr;
  max-height: 4 * 22 * @pr;
  overflow: hidden;
  text-overflow: clip;
}

.item-link {
  color: @antBlue;
}

.action-icon {
  display: inline-block;
  width: 22 * @pr;
}

.action-delete {
  position: relative;
  width: 32 * @pr;
  height: 32 * @pr;
  margin-left: 16 * @pr;
}
</style>