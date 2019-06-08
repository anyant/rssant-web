<template>
  <MoLayout header border>
    <MoBackHeader></MoBackHeader>
    <div class="main">
      <div class="avatar-wrapper">
        <mu-avatar size="64" class="user">
          <img :src="avatar">
        </mu-avatar>
      </div>
      <div class="username-wrapper">
        <span>{{ username }}</span>
      </div>
      <div class="button-wrapper">
        <mu-button class="button-logout" :color="antGold" @click="logout">退出登录</mu-button>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import { antGold } from '@/plugin/common'
import defaultAvatar from '@/assets/avatar.png'

export default {
  components: { MoLayout, MoBackHeader },
  data() {
    return { antGold }
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
    }
  },
  mounted() {},
  methods: {
    logout() {
      this.$API.user.logout({ next: '/login' })
    }
  }
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

.button-wrapper {
  margin-top: 96 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.button-logout {
  width: 152 * @pr;
  height: 40 * @pr;
  font-size: 18 * @pr;
  font-weight: bold;
  box-shadow: none;
}
</style>