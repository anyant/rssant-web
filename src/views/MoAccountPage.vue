<template>
  <MoLayout header>
    <MoBackHeader center-title>
      <template v-slot:title>{{ username }}</template>
    </MoBackHeader>
    <div class="main">
      <div class="action-group action-group-vip">
        <div class="action-row" @click="goVip">
          <span class="action-label">蚁阅会员</span>
          <span>
            <span>{{ customerBalance }} 到期</span>
            <fa-icon class="action-icon" icon="chevron-right" />
          </span>
        </div>
      </div>
      <div class="action-group">
        <div class="action-row" :class="{'disabled': isGithubConnected}" @click="connectGithub">
          <span class="action-label">GitHub登录</span>
          <span>
            <span>{{ isGithubConnected ? '已绑定' : '绑定' }}</span>
            <fa-icon class="action-icon" icon="chevron-right" />
          </span>
        </div>
        <div
          class="action-row"
          :class="{'disabled': isPasswordConfigured}"
          @click="configurePassword"
        >
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
import { antGold, antRed, antGreen } from '@/plugin/common'
import { formatDate } from '@/plugin/datefmt'

export default {
  name: 'MoAccountPage',
  components: { MoLayout, MoBackHeader },
  data() {
    return {
      antGold,
      antRed,
      antGreen,
    }
  },
  computed: {
    customerBalance() {
      let dt = this.$API.user.balance
      if (_.isNil(dt)) {
        return '-'
      }
      return formatDate(dt)
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
  },
  mounted() {},
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
      if (this.isGithubConnected) {
        return
      }
      this.$loading({ size: 24 })
      this.$API.user.connectGithub({ next: '/' })
    },
    exportOPML() {
      this.$API.feed.exportOPML({ download: true })
    },
    goVip() {
      this.$router.push('/vip')
    },
    goAbout() {
      this.$router.push('/about')
    },
    onLogout() {
      this.$API.user.logout().then(() => {
        window.location.assign('/')
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.divider {
  margin-top: 8px;
  margin-bottom: 8px;
  border-bottom: solid 1px @antLineGrey;
}

.action-group {
  background: @antBackWhite;
}

.action-group-vip {
  margin-top: 8px;
  margin-bottom: 8px;
  background: lighten(@antGold, 48%);
  color: @antTextBlack;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
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
  font-size: 16px;
}

.action-icon {
  margin-left: 8px;
  color: lighten(@antTextSemi, 10%);
  position: relative;
  top: 1px;
}

.action-logout {
  color: @antRed;
}
</style>
