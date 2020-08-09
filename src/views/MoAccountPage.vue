<template>
  <MoLayout header>
    <MoBackHeader></MoBackHeader>
    <div class="main">
      <div class="main-wrapper" :style="wrapperStyle">
        <div class="username-wrapper">
          <span>{{ username }}</span>
        </div>
        <div class="action-container">
          <div class="action-wrapper">
            <MoPWAButton />
          </div>
          <div class="action-wrapper">
            <mu-button
              class="button-configure-password"
              :color="antGreen"
              :disabled="isPasswordConfigured"
              @click="configurePassword"
            >{{ isPasswordConfigured ? '密码已设置' : '设置密码' }}</mu-button>
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
      <MoFooter />
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import MoFooter from '@/components/MoFooter'
import MoPWAButton from '@/components/MoPWAButton'
import { antGold, antRed, antGreen } from '@/plugin/common'

export default {
  name: 'MoAccountPage',
  components: { MoLayout, MoBackHeader, MoFooter, MoPWAButton },
  data() {
    return {
      antGold,
      antRed,
      antGreen,
      githubLoading: false,
    }
  },
  computed: {
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
    isPasswordConfigured() {
      let user = this.$API.user.loginUser
      if (!this.$API.user.isLogined || _.isNil(user)) {
        return false
      }
      return _.isNil(user.has_usable_password) || user.has_usable_password
    },
    username() {
      let user = this.$API.user.loginUser
      return _.isNil(user) ? '' : user.username
    },
    wrapperStyle() {
      return {
        minHeight: `${this.$LAYOUT.windowInnerHeight - 48}px`,
      }
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
    configurePassword() {
      this.$prompt(null, '请输入新密码', {
        inputType: 'password',
        beforeClose: (result, instance, done) => {
          if (!result) {
            return done()
          }
          this.$API.user
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
      this.githubLoading = true
      this.$API.user.connectGithub({ next: '/' })
    },
    logout() {
      this.$API.user.logout().then(() => {
        window.location.assign('/')
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

.main-wrapper {
  min-height: 100vh;
  padding-bottom: @footerHeight;
}

.username-wrapper {
  padding-top: 32 * @pr;
  font-size: 18 * @pr;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.action-container {
  margin-top: 48 * @pr;
}

.action-wrapper {
  margin-top: 32 * @pr;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-configure-password,
.button-connect-github,
.button-logout,
.button-delete-all-feed {
  width: 168 * @pr;
  height: 36 * @pr;
  font-size: 16 * @pr;
  font-weight: bold;
  box-shadow: none;
}

.button-configure-password.disabled,
.button-connect-github.disabled {
  background-color: lighten(@antGreen, 10%);
  color: @antTextWhite;
}
</style>
