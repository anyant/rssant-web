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
        <div class="item-info">
          <template v-if="form.isTitleEdit">
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
      </div>
      <div class="item group-item">
        <span class="item-name">分组</span>
        <div class="item-info">
          <template v-if="form.isGroupEdit">
            <input class="item-input" v-model="form.group" />
            <span class="item-button item-button-save" @click="onSaveGroup()">
              <fa-icon class="item-button-icon" :color="antBlue" icon="save" />
            </span>
          </template>
          <template v-else>
            <span class="item-value">{{ getGroupName(feedGroup) }}</span>
            <span class="item-button item-button-edit" @click="onEditGroup()">
              <fa-icon class="item-button-icon" icon="edit" />
            </span>
          </template>
        </div>
      </div>
      <div v-if="form.isGroupEdit" class="item group-item-selector">
        <span class="item-name"></span>
        <div class="item-info">
          <span
            class="group-name"
            v-for="name in avaliableGroupNames"
            :key="name"
            @click="onSelectGroup(name)"
          >{{ name }}</span>
        </div>
      </div>
      <div class="item" v-for="item in feedInfo" :key="item.name">
        <span class="item-name">{{ item.name }}</span>
        <div class="item-info">
          <a
            v-if="item.type === 'link'"
            class="item-link"
            :href="item.value"
            target="_blank"
          >{{ item.value }}</a>
          <span v-else class="item-value">{{ item.value }}</span>
        </div>
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
import { getGroupName, getGroupId } from '@/plugin/feedGroupHelper'

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
        title: null,
        isTitleEdit: false,
        group: null,
        isGroupEdit: false,
      },
    }
  },
  async mounted() {
    await this.$API.feed.load({ feedId: this.feedId, detail: true })
    await this.$API.syncFeedLoadMushrooms()
  },
  computed: {
    feedId() {
      return this.$route.query.id
    },
    feed() {
      return this.$API.feed.get(this.feedId)
    },
    feedTitle() {
      return _.isNil(this.feed) ? '' : this.feed.title
    },
    avaliableGroupNames() {
      return this.$API.feed.avaliableGroupNames
    },
    feedGroup() {
      return this.$API.feed.groupOf(this.feed)
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
    getGroupName,
    getGroupId,
    onEditTitle() {
      this.form.title = this.feedTitle
      this.form.isTitleEdit = true
    },
    async onSaveTitle() {
      if (this.form.title !== this.feedTitle) {
        try {
          await this.$API.feed.setTitle({ feedId: this.feedId, title: this.form.title })
        } catch (ex) {
          this.$toast.error(`更新失败: ${ex.message}`)
        }
      }
      this.form.isTitleEdit = false
    },
    onEditGroup() {
      this.form.group = getGroupName(this.feedGroup)
      this.form.isGroupEdit = true
    },
    onSelectGroup(name) {
      this.form.group = name
    },
    async onSaveGroup() {
      let group = getGroupId(this.form.group)
      if (!_.isEmpty(group) && group !== this.feedGroup) {
        try {
          await this.$API.feed.setGroup({ feedId: this.feedId, group: group })
        } catch (ex) {
          this.$toast.error(`更新失败: ${ex.message}`)
        }
      }
      this.form.isGroupEdit = false
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
}

.group-item {
  padding-bottom: 8 * @pr;
}

.title-item,
.group-item {
  min-height: 52 * @pr;

  .item-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-value,
  .item-input {
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

.group-item-selector {
  padding-top: 0;
  .item-info {
    position: relative;
    left: -8 * @pr;
  }
  .group-name {
    display: inline-block;
    min-width: 64 * @pr;
    text-align: center;
    margin-right: 16 * @pr;
    margin-bottom: 8 * @pr;
    padding: 1 * @pr 12 * @pr;
    border: solid 1 * @pr @antBlue;
    border-radius: 14 * @pr;
    cursor: pointer;
    &:active {
      background: lighten(@antBlue, 30%);
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

.item-info {
  width: 100%;
  overflow: hidden;
  text-overflow: clip;
}

.item-value,
.item-link {
  font-size: 15 * @pr;
  max-height: 4 * 22 * @pr;
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