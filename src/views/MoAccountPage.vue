<template>
  <MoLayout header>
    <MoBackHeader center-title>
      <template v-slot:title>{{ username }}</template>
      <MoDarkModeDialog :open.sync="isDarkModeDialogOpen" @change="onDarkModeChange" />
    </MoBackHeader>
    <div class="main">
      <div
        class="action-group action-group-vip"
        :class="{ 'balance-not-enough': !isBalanceEnough }"
        v-if="isShopantEnable"
      >
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
        <div class="action-row" @click="exportOPML">
          <span class="action-label">导出订阅</span>
          <fa-icon class="action-icon" icon="chevron-right" />
        </div>
        <div class="action-row" @click="onClickDarkMode">
          <span class="action-label">夜间模式</span>
          <span>
            <span>{{ darkModeStatus }}</span>
            <fa-icon class="action-icon" icon="chevron-right" />
          </span>
        </div>
        <div class="action-row" @click="goAbout">
          <span class="action-label">蚁阅介绍</span>
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
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import MoDarkModeDialog from '@/components/MoDarkModeDialog'
import { antGold, antRed, antGreen } from '@/plugin/common'
import { formatDate } from '@/plugin/datefmt'
import DarkMode from '@/plugin/darkmode'
import { userStore } from '@/store/user'
import { feedStore } from '@/store/feed'

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
    }
  },
  computed: {
    isShopantEnable() {
      return userStore.isShopantEnable
    },
    customerBalance() {
      let dt = userStore.balance
      if (_.isNil(dt)) {
        return '####-##-##'
      }
      return formatDate(dt)
    },
    isBalanceEnough() {
      return userStore.isBalanceEnough
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
    darkModeStatus() {
      if (!DarkMode.isSupported()) {
        return '不支持'
      }
      return { auto: '跟随系统', enable: '已开启', disable: '已关闭' }[this.darkModeValue]
    },
  },
  mounted() {
    userStore.syncProduct()
  },
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
            .catch((error) => {
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
      feedStore.exportOPML({ download: true })
    },
    goVip() {
      this.$router.push('/vip')
    },
    goAbout() {
      this.$router.push('/about')
    },
    onClickDarkMode() {
      this.isDarkModeDialogOpen = true
    },
    onDarkModeChange() {
      this.darkModeValue = DarkMode.get()
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

.balance-not-enough .vip-balance {
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

.action-icon {
  margin-left: 8 * @pr;
  color: lighten(@antTextSemi, 10%);
  position: relative;
  top: 1 * @pr;
}
</style>
