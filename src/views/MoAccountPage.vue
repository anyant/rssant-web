<template>
  <MoLayout header footer>
    <MoBackHeader></MoBackHeader>
    <div class="main">
      <div class="avatar-wrapper">
        <mu-avatar size="64" class="user">
          <img :src="avatar" />
        </mu-avatar>
      </div>
      <div class="username-wrapper">
        <span>{{ username }}</span>
      </div>
      <div class="action-container">
        <div class="action-wrapper">
          <div class="action-pwa" @click.capture.stop.prevent="togglePWA">
            <mu-checkbox
              v-model="isPWAEnable"
              :uncheck-icon="hasPWA?'favorite_border':'help_outline'"
              checked-icon="favorite"
              :label="isPWAEnable?'已添加到主屏':'添加到主屏'"
              :label-left="true"
              :ripple="false"
            ></mu-checkbox>
          </div>
        </div>
        <div class="action-wrapper">
          <mu-button
            class="button-connect-github"
            :color="antGreen"
            :disabled="isGithubConnected"
            @click="connectGithub"
            v-loading="githubLoading"
            data-mu-loading-size="24"
          >{{ isGithubConnected ? 'GitHub已绑定' : '绑定GitHub' }}</mu-button>
        </div>
        <div class="action-wrapper">
          <mu-button class="button-delete-all-feed" :color="antRed" @click="deleteAllFeed">删除全部订阅</mu-button>
        </div>
        <div class="action-wrapper">
          <mu-button class="button-logout" :color="antGold" @click="logout">退出登录</mu-button>
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <MoFooter />
    </template>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import MoFooter from '@/components/MoFooter'
import localConfig from '@/plugin/localConfig'
import { antGold, antRed, antGreen } from '@/plugin/common'
import defaultAvatar from '@/assets/avatar.svg'

const hasPWA = 'serviceWorker' in navigator

export default {
  components: { MoLayout, MoBackHeader, MoFooter },
  data() {
    return {
      antGold,
      antRed,
      antGreen,
      hasPWA,
      isPWAEnable: localConfig.PWA_ENABLE.get(),
      githubLoading: false,
    }
  },
  computed: {
    avatar() {
      let user = this.$API.user.loginUser
      if (_.isNil(user) || _.isEmpty(user.avatar_url)) {
        return defaultAvatar
      } else {
        return user.avatar_url
      }
    },
    isGithubConnected() {
      let user = this.$API.user.loginUser
      if (!this.$API.user.isLogined || _.isNil(user)) {
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
    username() {
      let user = this.$API.user.loginUser
      return _.isNil(user) ? '' : user.username
    },
  },
  mounted() {},
  methods: {
    deleteAllFeed() {
      this.$confirm(`要删除你的全部订阅吗？此操作不可恢复！`, '危险操作', {
        type: 'warning',
        okLabel: '删除全部订阅',
      }).then(({ result }) => {
        if (result) {
          this.$API.feed
            .deleteAll()
            .then(() => {
              this.$toast.success('删除成功')
            })
            .catch(error => {
              this.$toast.message('删除失败: ' + error.message)
            })
        }
      })
    },
    connectGithub() {
      this.githubLoading = true
      this.$API.user.connectGithub({ next: '/' })
    },
    logout() {
      this.$API.user.logout({ next: '/' })
    },
    togglePWA() {
      if (!hasPWA) {
        this.$alert('可以尝试用Chrome，Safari，火狐，微软Edge，小米浏览器等打开蚁阅。', '当前浏览器不支持添加到主屏', {
          okLabel: '好的',
        })
        return
      }
      if (this.isPWAEnable) {
        this.disablePWA()
      } else {
        this.enablePWA()
      }
    },
    enablePWA() {
      if (hasPWA) {
        localConfig.PWA_ENABLE.set(true)
        this.isPWAEnable = true
        const h = this.$createElement
        let content = h('ol', null, [
          h('li', null, [h('span', null, '页面刷新后，浏览器可能会弹出 "将蚁阅添加到主屏" 提示，点击确认即可')]),
          h('li', null, [h('span', null, '如果没有弹出提示，可以从浏览器菜单将蚁阅添加到主屏')]),
          h('li', null, [h('span', null, '安卓系统上，浏览器可能需要 "桌面快捷方式" 权限，可以在系统设置中授权')]),
          h('li', null, [h('span', null, '如果使用中遇到问题，可尝试关闭此功能，清除浏览器缓存')]),
        ])
        this.$alert(content, '将蚁阅添加到主屏', {
          className: 'action-pwa-dialog',
          okLabel: '知道了',
        }).then(() => {
          location.assign('/')
        })
      }
    },
    disablePWA() {
      if (hasPWA) {
        localConfig.PWA_ENABLE.set(false)
        this.isPWAEnable = false
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for (let registration of registrations) {
            registration.unregister()
          }
        })
        if (!_.isNil(window.caches)) {
          caches.keys().then(function(names) {
            for (let name of names) {
              caches.delete(name)
            }
          })
        }
        this.$toast.success('已关闭添加到主屏功能')
      }
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

.avatar-wrapper {
  margin-top: 16 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.username-wrapper {
  margin-top: 16 * @pr;
  font-size: 18 * @pr;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.action-container {
  margin-top: 64 * @pr;
}

.action-wrapper {
  margin-top: 32 * @pr;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-pwa {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168 * @pr;
  height: 36 * @pr;
  border-radius: 2 * @pr;
  cursor: pointer;
  background: @antGreen;
  color: #ffffff;
}

.button-connect-github,
.button-logout,
.button-delete-all-feed {
  width: 168 * @pr;
  height: 36 * @pr;
  font-size: 16 * @pr;
  font-weight: bold;
  box-shadow: none;
}

.button-connect-github.disabled {
  background-color: lighten(@antGreen, 10%);
  color: @antTextWhite;
}
</style>

<style lang="less">
@import '~@/styles/common';

.action-pwa {
  .mu-checkbox .mu-checkbox-icon,
  .mu-checkbox .mu-checkbox-label {
    font-weight: bold;
    font-size: 16 * @pr;
    color: #ffffff;
  }
  .mu-checkbox .mu-checkbox-icon {
    margin-left: 4 * @pr;
    .mu-icon {
      font-size: 22 * @pr;
    }
  }
}
.action-pwa-dialog {
  ol {
    padding-left: 20 * @pr;
  }
}
</style>