<template>
  <MoLayout header border>
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
        <div class="action-wrapper action-pwa" v-if="hasPWA">
          <div class="pwa-label">
            <span>PWA模式</span>
            <span v-if="hasPWA" class="pwa-label-info">(实验功能)</span>
            <span v-else class="pwa-label-info">(当前浏览器不支持)</span>
          </div>
          <mu-switch
            class="pwa-switch"
            v-model="isPWAEnable"
            @change="togglePWA"
            :disabled="!hasPWA"
          ></mu-switch>
        </div>
        <div class="action-wrapper">
          <mu-button class="button-delete-all-feed" :color="antRed" @click="deleteAllFeed">删除全部订阅</mu-button>
        </div>
        <div class="action-wrapper">
          <mu-button class="button-logout" :color="antGold" @click="logout">退出登录</mu-button>
        </div>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import localConfig from '@/plugin/localConfig'
import { antGold, antRed } from '@/plugin/common'
import defaultAvatar from '@/assets/avatar.png'

const hasPWA = 'serviceWorker' in navigator

export default {
  components: { MoLayout, MoBackHeader },
  data() {
    return { antGold, antRed, hasPWA, isPWAEnable: localConfig.PWA_ENABLE.get() }
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
    logout() {
      this.$API.user.logout({ next: '/' })
    },
    togglePWA(newValue) {
      if (hasPWA) {
        if (newValue) {
          this.enablePWA()
        } else {
          this.disablePWA()
        }
      }
    },
    enablePWA() {
      if (hasPWA) {
        localConfig.PWA_ENABLE.set(true)
        this.isPWAEnable = true
        this.$alert('即将刷新页面以开启PWA', '开启PWA', {
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
        this.$toast.success('PWA已关闭')
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
  margin-top: 24 * @pr;
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
  margin-top: 96 * @pr;
}

.action-wrapper {
  margin-top: 40 * @pr;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pwa-label {
  font-weight: bold;
  font-size: 18 * @pr;

  .pwa-label-info {
    margin-right: 16px;
  }
  .mu-switch {
    cursor: pointer;
  }
}

.button-logout,
.button-delete-all-feed {
  width: 152 * @pr;
  height: 40 * @pr;
  font-size: 18 * @pr;
  font-weight: bold;
  box-shadow: none;
}
</style>