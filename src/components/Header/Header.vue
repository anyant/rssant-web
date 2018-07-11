<template>
  <div class="header">
    <div class="logo" @click="handleLogoClick">
      <span class="logo-rss">RSS</span>
      <span class="logo-ant">Ant</span>
    </div>
    <div class="actions">
      <mu-button flat mini class="action create-feed" @click="openDialog">
        <i class="fa fa-plus"></i>
        <span>订阅</span>
      </mu-button>
      <div class="action user">
        <div v-if="isLogin" class="user-menu">
          <mu-menu placement="bottom" open-on-hover>
            <mu-button flat class="user-menu-button">
              <mu-avatar size="36" class="user-avatar">
                <img :src="currentUser.avatar_url">
              </mu-avatar>
            </mu-button>
            <mu-list slot="content" class="user-menu-item">
              <mu-list-item button>后台任务</mu-list-item>
              <mu-divider></mu-divider>
              <mu-list-item button @click="handleLogout">退出登录</mu-list-item>
            </mu-list>
          </mu-menu>
        </div>
        <mu-button flat v-else @click="handleLogin" class="user-login">
          <i class="user-login-icon fa fa-github" aria-hidden="true"></i>
          <label class="user-login-label">GitHub登录</label>
        </mu-button>
      </div>
    </div>
    <div v-loading.fullscreen.lock="loginLoading"></div>
    <FeedDialog :isOpen="isDialogOpen" :close="closeDialog" :save="handleCreateFeed"></FeedDialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FeedDialog from './FeedDialog'

export default {
  components: { FeedDialog },

  data() {
    return {
      userMenuTrigger: null,
      isUserMenuOpen: false,
      isDialogOpen: false,
      loginLoading: false
    }
  },

  computed: {
    ...mapGetters(['isLogin', 'currentUser', 'feedList'])
  },

  methods: {
    ...mapActions(['login', 'logout', 'createFeed', 'fetchFeed']),

    handleLogoClick() {
      location.assign('/')
    },

    async handleLogin() {
      this.loginLoading = true
      await this.login()
    },

    async handleLogout() {
      await this.logout()
      this.closeUserMenu()
    },

    toggleUserMenu() {
      this.isUserMenuOpen = !this.isUserMenuOpen
    },

    closeUserMenu() {
      this.isUserMenuOpen = false
    },

    async handleCreateFeed(feedUrl) {
      let feed = await this.createFeed({ url: feedUrl })
      let feedId = feed.id
      let numTry = 10
      const token = setInterval(async () => {
        try {
          feed = await this.fetchFeed(feedId)
        } finally {
          numTry -= 1
          if (feed.status === 'ready' || numTry <= 0) {
            clearInterval(token)
          }
        }
      }, 1000)
    },

    closeDialog() {
      this.isDialogOpen = false
    },

    openDialog() {
      this.isDialogOpen = true
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/common.less';

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 8px;
  border-bottom: 1px solid #e9e9e9;

  .logo {
    min-width: 108px;
    display: inline-block;
  }

  .actions {
    flex: 1;
  }
}

.logo {
  cursor: pointer;
}

.logo {
  font-size: 0;

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
}

.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 4px;
  padding-bottom: 4px;

  .action {
    margin-left: 8px;
  }
}

.create-feed {
  span {
    font-weight: 600;
    margin-left: 4px;
  }
}

.user {
  .user-menu {
    height: 48px;
    line-height: 48px;
    display: flex;
  }

  .user-menu-item {
    font-weight: 600;
  }

  .user-menu-button {
    height: 48px;
    line-height: 48px;
    text-transform: none;
    padding-left: 4px;
    padding-right: 4px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    margin-top: 4px;
    margin-bottom: 4px;
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
  .login-loading {
    color: #66bb6a;
  }
}
</style>
