<template>
  <MoLayout header>
    <MoBackHeader center-title>
      <template v-slot:title>{{ username }}</template>
      <MoDarkModeDialog :open.sync="isDarkModeDialogOpen" @change="onDarkModeChange" />
    </MoBackHeader>
    <div class="main">
      <div class="action-group action-group-vip" :class="{ 'balance-notice': shouldNoticeVip }" v-if="isVipEnable">
        <div class="action-row" @click="goVip">
          <span class="action-label">蚁阅会员</span>
          <span>
            <span class="vip-balance">{{ customerBalance }} 到期</span>
            <fa-icon class="action-icon" icon="chevron-right" />
          </span>
        </div>
      </div>
      <div class="action-group">
        <div class="action-row" :class="{ disabled: isGithubConnected }" @click="connectGithub">
          <span class="action-label">GitHub登录</span>
          <span>
            <span>{{ isGithubConnected ? '已绑定' : '绑定' }}</span>
            <fa-icon class="action-icon" icon="chevron-right" />
          </span>
        </div>
        <div class="action-row" :class="{ disabled: isPasswordConfigured }" @click="configurePassword">
          <span class="action-label">密码登录</span>
          <span>
            <span>{{ isPasswordConfigured ? '已设置' : '设置密码' }}</span>
            <fa-icon class="action-icon" icon="chevron-right" />
          </span>
        </div>
        <div class="action-row" :class="{ disabled: exporting }" @click="exportOPML">
          <span class="action-label">导出订阅</span>
          <fa-icon class="action-icon" icon="chevron-right" />
        </div>
        <div class="action-row" :class="{ disabled: exporting }" @click="exportFavorited">
          <span class="action-label">导出收藏</span>
          <fa-icon class="action-icon" icon="chevron-right" />
        </div>
        <div class="action-row" @click="onClickDarkMode">
          <span class="action-label">夜间模式</span>
          <span>
            <span>{{ darkModeStatus }}</span>
            <fa-icon class="action-icon" icon="chevron-right" />
          </span>
        </div>
        <div class="action-row" @click="onClickStoryOrder">
          <span class="action-label">阅读顺序</span>
          <span>
            <span>{{ storyOrderText }}</span>
            <fa-icon class="action-icon" icon="chevron-right" />
          </span>
        </div>
        <div class="action-row" @click="onClickArticleList">
          <span class="action-label">文章列表</span>
          <span>
            <span>{{ articleListText }}</span>
            <fa-icon class="action-icon" icon="chevron-right" />
          </span>
        </div>
        <div class="action-row" @click="goAbout">
          <span class="action-label">蚁阅介绍</span>
          <fa-icon class="action-icon" icon="chevron-right" />
        </div>
        <div class="action-row" @click="goChangelog">
          <span class="action-label">更新日志</span>
          <fa-icon class="action-icon" icon="chevron-right" />
        </div>
      </div>
      <div class="divider"></div>
      <div class="action-group">
        <div class="action-row" @click="goTerms">
          <span class="action-label">用户协议</span>
          <fa-icon class="action-icon" icon="chevron-right" />
        </div>
        <div class="action-row" @click="goPrivacy">
          <span class="action-label">隐私政策</span>
          <fa-icon class="action-icon" icon="chevron-right" />
        </div>
        <div class="action-row" @click="goComplaint">
          <span class="action-label">投诉与举报</span>
          <fa-icon class="action-icon" icon="chevron-right" />
        </div>
      </div>
      <div class="divider"></div>
      <div class="action-group">
        <div class="action-row action-logout" @click="onLogout">
          <span class="action-label">退出登录</span>
        </div>
      </div>
      <div class="divider"></div>
    </div>
    <mu-dialog
      title="阅读顺序"
      :open.sync="isStoryOrderDialogOpen"
      :overlay-close="false"
    >
      <div class="story-order-option">
        <mu-radio value="old_first" v-model="storyOrderValue" label="最早在前" :ripple="false"></mu-radio>
        <div class="story-order-desc">打开一篇，更早的标为已读</div>
      </div>
      <div class="story-order-option">
        <mu-radio value="new_first" v-model="storyOrderValue" label="最新在前" :ripple="false"></mu-radio>
        <div class="story-order-desc">打开一篇，只标这一篇</div>
      </div>
      <mu-button slot="actions" flat color="primary" @click="onConfirmStoryOrder">确定</mu-button>
    </mu-dialog>
    <mu-dialog
      title="文章列表"
      :open.sync="isArticleListDialogOpen"
      :overlay-close="false"
    >
      <div class="story-order-option">
        <mu-radio value="title" v-model="articleListValue" label="仅标题" :ripple="false"></mu-radio>
        <div class="story-order-desc">列表更紧凑，一屏看到更多标题</div>
      </div>
      <div class="story-order-option">
        <mu-radio value="summary" v-model="articleListValue" label="标题和摘要" :ripple="false"></mu-radio>
        <div class="story-order-desc">每条标题下多显示两三行文章开头</div>
      </div>
      <mu-button slot="actions" flat color="primary" @click="onConfirmArticleList">确定</mu-button>
    </mu-dialog>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import MoDarkModeDialog from '@/components/MoDarkModeDialog'
import { antGold, antRed, antGreen } from '@/plugin/common'
import DarkMode from '@/plugin/darkmode'
import localConfig from '@/plugin/localConfig'
import { userStore } from '@/store/user'
import { feedStore } from '@/store/feed'
import { API } from '@/plugin/api'
import { todayStamp } from '@/plugin/download'
import { confirmAndDownload } from '@/plugin/export'

export default {
  name: 'MoAccountPage',
  components: { MoLayout, MoBackHeader, MoDarkModeDialog },
  data() {
    return {
      antGold,
      antRed,
      antGreen,
      isDarkModeDialogOpen: false,
      darkModeValue: DarkMode.get(),
      isStoryOrderDialogOpen: false,
      storyOrderValue: localConfig.STORY_ORDER.get(),
      isArticleListDialogOpen: false,
      articleListValue: localConfig.ARTICLE_LIST_CONTENT.get(),
      exporting: false,
    }
  },
  computed: {
    isVipEnable() {
      return userStore.isVipEnable
    },
    shouldNoticeVip() {
      return userStore.shouldNoticeVip
    },
    customerBalance() {
      return userStore.balanceText
    },
    isGithubConnected() {
      let user = userStore.loginUser
      if (!userStore.isLogined || _.isNil(user)) {
        return false
      }
      if (_.isNil(user.social_accounts)) {
        return false
      }
      for (let i = 0; i < user.social_accounts.length; i++) {
        let acc = user.social_accounts[i]
        if (_.isEqual(acc.provider, 'github')) {
          return true
        }
      }
      return false
    },
    isPasswordConfigured() {
      let user = userStore.loginUser
      if (!userStore.isLogined || _.isNil(user)) {
        return false
      }
      return _.isNil(user.has_usable_password) || user.has_usable_password
    },
    username() {
      let user = userStore.loginUser
      return _.isNil(user) ? '' : user.username
    },
    storyOrderText() {
      return this.storyOrderValue === 'new_first' ? '最新在前' : '最早在前'
    },
    articleListText() {
      return this.articleListValue === 'summary' ? '标题和摘要' : '仅标题'
    },
    darkModeStatus() {
      if (!DarkMode.isSupported()) {
        return '不支持'
      }
      return { auto: '跟随系统', enable: '已开启', disable: '已关闭' }[this.darkModeValue]
    },
  },
  mounted() { },
  methods: {
    configurePassword() {
      if (this.isPasswordConfigured) {
        return
      }
      this.$prompt(null, '请输入新密码', {
        inputType: 'password',
        beforeClose: (result, instance, done) => {
          if (!result) {
            return done()
          }
          userStore
            .changePassword({ password: instance.value })
            .then(() => done())
            .catch(error => {
              instance.errorText = error.message
            })
        },
      }).then(({ result }) => {
        if (result) {
          this.$toast.success('密码设置成功')
        }
      })
    },
    connectGithub() {
      if (this.isGithubConnected) {
        return
      }
      this.$loading({ size: 24 })
      userStore.connectGithub({ next: '/' })
    },
    exportOPML() {
      if (this.exporting) {
        return
      }
      confirmAndDownload({
        vm: this,
        title: '导出订阅',
        message: '导出全部订阅，保存为 OPML 文件，可以导入其他阅读器。',
        request: () => feedStore.exportOPML({ download: true }),
        filename: () => 'rssant.opml',
        pendingMessage: '正在导出订阅…',
        setBusy: value => { this.exporting = value },
      })
    },
    exportFavorited() {
      if (this.exporting) {
        return
      }
      confirmAndDownload({
        vm: this,
        title: '导出收藏',
        message: '导出全部收藏，包含正文和文章信息，打包成一个压缩包。',
        request: () => API.story.exportFavorited(),
        filename: () => `rssant-favorites-${todayStamp()}.zip`,
        pendingMessage: '正在打包收藏…',
        setBusy: value => { this.exporting = value },
      })
    },
    async goVip() {
      await userStore.openVipHomeLink()
    },
    goAbout() {
      this.$router.push('/about')
    },
    goTerms() {
      this.$router.push('/terms')
    },
    goPrivacy() {
      this.$router.push('/privacy')
    },
    goComplaint() {
      this.$router.push('/complaint')
    },
    goChangelog() {
      window.open('/changelog', '_blank')
    },
    onClickDarkMode() {
      this.isDarkModeDialogOpen = true
    },
    onDarkModeChange() {
      this.darkModeValue = DarkMode.get()
    },
    onClickStoryOrder() {
      this.storyOrderValue = localConfig.STORY_ORDER.get()
      this.isStoryOrderDialogOpen = true
    },
    onConfirmStoryOrder() {
      this.isStoryOrderDialogOpen = false
      // 没有切换顺序就什么都不做，避免无意义的整页刷新
      if (this.storyOrderValue === localConfig.STORY_ORDER.get()) {
        return
      }
      localConfig.STORY_ORDER.set(this.storyOrderValue)
      setTimeout(() => {
        window.location.reload()
      }, 150)
    },
    onClickArticleList() {
      this.articleListValue = localConfig.ARTICLE_LIST_CONTENT.get()
      this.isArticleListDialogOpen = true
    },
    onConfirmArticleList() {
      this.isArticleListDialogOpen = false
      localConfig.ARTICLE_LIST_CONTENT.set(this.articleListValue)
    },
    onLogout() {
      userStore.logout().then(() => {
        window.location.assign('/')
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
  padding-top: 8 * @pr;
}

.divider {
  margin-top: 8 * @pr;
  margin-bottom: 8 * @pr;
  border-bottom: solid 1 * @pr lighten(@antLineGrey, 3%);
}

.action-group {
  background: @antBackWhite;
}

.action-group-vip {
  margin-bottom: 8 * @pr;
  background: lighten(@antGold, 48%);
  color: @antTextBlack;
}

.balance-notice .vip-balance {
  color: @antGold;
  font-weight: bold;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64 * @pr;
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  cursor: pointer;
}

.action-row.disabled {
  opacity: 0.8;
  color: @antTextGrey;
  cursor: not-allowed;
}

.action-label {
  font-weight: bold;
  font-size: 16 * @pr;
}

.story-order-option {
  padding: 8 * @pr 0;
}

.story-order-desc {
  padding-left: 32 * @pr;
  color: @antTextGrey;
  font-size: 12 * @pr;
  line-height: 1.4;
}

.action-icon {
  margin-left: 8 * @pr;
  color: lighten(@antTextSemi, 10%);
  position: relative;
  top: 1 * @pr;
}
</style>
