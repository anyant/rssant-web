<template>
  <div class="rssant-header">
    <div class="logo" @click="handleLogoClick">
      <span class="logo-rss">RSS</span><span class="logo-ant">Ant</span>
    </div>
    <div class="nav">
      <mu-tabs :value="activeTab" @change="handleTabChange" class="tabs">
        <mu-tab value="StoryList" title="故事" class="tabs-tab"/>
        <mu-tab value="FeedList" title="订阅" class="tabs-tab"/>
        <mu-tab value="TaskList" title="任务" class="tabs-tab"/>
      </mu-tabs>
    </div>
    <div class="actions">
      <mu-button flat mini @click="openDialog">
        <i class="fa fa-plus"></i>
      </mu-button>
    </div>
    <AddFeedDialog :open="dialogOpen" :close="closeDialog" :save="handleSaveFeed"></AddFeedDialog>
    <div class="user">
      <div v-if="isLogin" class="user-menu">
        <mu-button flat class="user-menu-button" ref="userMenuButton" @click="toggleUserMenu">
          <mu-avatar class="user-avatar" :src="currentUser.avatar_url"></mu-avatar>
          <span class="user-username">{{ currentUser.username }}</span>
        </mu-button>
        <mu-popover class="user-menu-list" :trigger="userMenuTrigger" :open="isUserMenuOpen">
          <mu-menu>
            <mu-menu-item title="Logout" @click="handleLogout"/>
          </mu-menu>
        </mu-popover>
      </div>
      <mu-button flat v-else @click="handleLogin" class="user-login">
        <i class="user-login-icon fa fa-github" aria-hidden="true"></i>
        <label class="user-login-label">GitHub登录</label>
      </mu-button >
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { AddFeedDialog } from './AddFeedDialog'

export default {
  components: { AddFeedDialog },
  data() {
    return {
      userMenuTrigger: null,
      isUserMenuOpen: false,
      dialogOpen: false
    }
  },
  computed: {
    ...mapGetters(['isLogin', 'currentUser', 'feedList']),
    activeTab() {
      return this.$route.name
    }
  },
  methods: {
    ...mapActions(['login', 'logout', 'fetchFeedList', 'saveFeed']),
    handleTabChange(val) {
      this.$router.replace({
        name: val
      })
    },
    handleLogoClick() {
      location.assign('/')
    },
    async handleLogin() {
      await this.login()
      this.updateUserMenuTrigger()
    },
    async handleLogout() {
      await this.logout()
      this.closeUserMenu()
    },
    toggleUserMenu() {
      if (this.userMenuTrigger == null) {
        return
      }
      this.isUserMenuOpen = !this.isUserMenuOpen
    },
    closeUserMenu() {
      if (this.userMenuTrigger == null) {
        return
      }
      this.isUserMenuOpen = false
    },
    updateUserMenuTrigger() {
      if (this.isLogin) {
        this.userMenuTrigger = this.$refs.userMenuButton.$el
      }
    },
    async handleSaveFeed(feedUrl) {
      await this.saveFeed({ url: feedUrl })
    },
    closeDialog() {
      this.dialogOpen = false
    },
    openDialog() {
      this.dialogOpen = true
    }
  },
  afterLogin() {
    this.updateUserMenuTrigger()
  }
}
</script>

<style lang="less">
@import '../../styles/common.less';

.rssant-header {
  height: 64px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 8px;
  padding-right: 8px;
  border-bottom: 1px solid #e9e9e9;
  display: flex;
}

.rssant-header {
  .logo {
    min-width: 108px;
    cursor: pointer;
  }
  .logo-rss,
  .logo-ant {
    display: inline-block;
    font-size: 28px;
    padding-top: 10px;
    padding-bottom: 10px;
    line-height: 1;
    font-weight: 600;
  }

  .logo-rss {
    color: #f44336;
  }
  .logo-ant {
    color: #66bb6a;
  }

  .logo,
  .nav {
    display: inline-block;
  }

  .nav {
    flex: 1;
  }

  .tabs {
    margin: 0 auto;
    width: 400px;
  }

  .tabs-tab {
    font-size: 18px;
    font-weight: 600;
  }

  .actions {
    padding-top: 4px;
    padding-bottom: 4px;
    margin-left: 16px;
    margin-right: 16px;
  }

  .user-menu {
    height: 48px;
    line-height: 48px;
    display: flex;
  }

  .user-menu-button {
    height: 48px;
    line-height: 48px;
    text-transform: none;
    padding-left: 8px;
    padding-right: 8px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    margin-top: 4px;
    margin-bottom: 4px;
  }

  .user-username {
    display: inline-block;
    flex: 1;
    padding-left: 4px;
    font-size: 20px;
  }

  .user-login {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 8px;
    padding-right: 8px;
    line-height: 28px;
    height: 48px;
  }

  .user-login-icon {
    font-size: 24px;
  }

  .user-login-label {
    padding-left: 4px;
    font-size: 14px;
    font-weight: 700;
  }
}
</style>
