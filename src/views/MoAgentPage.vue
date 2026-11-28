<template>
  <MoLayout header>
    <MoBackHeader center-title>
      <template v-slot:title>用 AI 阅读</template>
    </MoBackHeader>
    <div class="main">
      <p class="intro">
        复制提示词，发给你的 AI。它会先读接口说明和每日精选技能，再按你的要求读文章、发现和添加订阅、整理订阅、标记已读或收藏。
      </p>
      <div class="prompt-box">{{ promptPreview }}</div>
      <p class="prompt-hint">令牌已隐藏，复制时自动带上</p>
      <div class="copy-btn" @click="copyPrompt">复制提示词</div>
      <div class="divider"></div>
      <div class="section-title">令牌</div>
      <p class="section-text">令牌长期有效，不会过期。</p>
      <div class="reset-btn" @click="resetToken">重置令牌</div>
      <p class="warning">
        令牌等同于账号密码，只发给你信任的 AI。重置后旧令牌立即失效，已经发给 AI 的提示词不能再读取数据；当前登录和其他网页设备不受影响。
      </p>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import { API } from '@/plugin/api'
import { userStore } from '@/store/user'

const TOKEN_MASK = '••••••••••••••••••••'

export default {
  name: 'MoAgentPage',
  components: { MoLayout, MoBackHeader },
  data() {
    return {
      token: '',
    }
  },
  mounted() {
    const user = userStore.loginUser
    this.token = _.isNil(user) ? '' : user.token
  },
  computed: {
    promptPreview() {
      return this.buildPrompt(TOKEN_MASK)
    },
  },
  methods: {
    buildPrompt(token) {
      const origin = window.location.origin
      return [
        '你是我的蚁阅（RSSAnt）阅读助手。用下面的令牌调接口，帮我查订阅、读文章、找收藏、发现和添加订阅、整理订阅。',
        '',
        '令牌:',
        token,
        '接口说明:',
        origin + '/docs/agent.md',
        '每日精选技能（默认推荐，可以换成你自己的）:',
        origin + '/docs/daily-digest.md',
        '',
        '规则：先读接口说明再调用；列表先 detail=false，选中文章再取正文；改数据（标已读、收藏、添加订阅、改标题/分组、删除、导入）前先问我；每日精选按我在偏好文件里的选择标已读时不用再问；401 就告诉我令牌失效了，请我到「用 AI 阅读」重新复制提示词。',
        '',
        '先按每日精选技能，告诉我今天有什么值得看的。',
      ].join('\n')
    },
    async copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return
      }
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    },
    async copyPrompt() {
      if (_.isEmpty(this.token)) {
        this.$toast.error('登录信息已失效，请重新登录')
        return
      }
      try {
        await this.copyText(this.buildPrompt(this.token))
        this.$toast.success('提示词已复制')
      } catch (error) {
        this.$toast.error('复制失败，请重试')
      }
    },
    resetToken() {
      this.$confirm(
        '重置后旧令牌立即失效，已经发给 AI 的提示词不能再读取数据；当前登录和其他网页设备不受影响。',
        '重置令牌',
        { type: 'warning' }
      ).then(({ result }) => {
        if (!result) {
          return
        }
        API.user
          .resetToken()
          .then(res => {
            this.token = res.token
            userStore.SET_TOKEN(res.token)
            this.$toast.success('已重置，旧令牌已失效')
          })
          .catch(error => {
            this.$toast.error('重置失败：' + error.message)
          })
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
  padding: 0 16 * @pr 24 * @pr;
}

.intro {
  padding: 16 * @pr 0 10 * @pr;
  margin: 0;
  font-size: 13 * @pr;
  line-height: 20 * @pr;
  color: @antTextSemi;
}

.prompt-box {
  box-sizing: border-box;
  height: 180 * @pr;
  overflow-y: auto;
  padding: 10 * @pr 12 * @pr;
  border: 1px solid @antLineGrey;
  border-radius: 6 * @pr;
  background: @antBackGrey;
  color: @antTextSemi;
  font-family: Menlo, Consolas, monospace;
  font-size: 11 * @pr;
  line-height: 16 * @pr;
  white-space: pre-wrap;
  word-break: break-all;
}

.prompt-hint {
  margin: 4 * @pr 0 8 * @pr;
  font-size: 12 * @pr;
  color: @antTextLight;
}

.copy-btn {
  padding: 11 * @pr 0;
  border-radius: 6 * @pr;
  background: @antGreen;
  color: #fff;
  text-align: center;
  font-size: 15 * @pr;
  font-weight: 600;
}

.divider {
  height: 1px;
  margin: 16 * @pr 0 14 * @pr;
  background: @antLineGrey;
}

.section-title {
  margin-bottom: 6 * @pr;
  font-size: 15 * @pr;
  font-weight: 600;
}

.section-text {
  margin: 0 0 10 * @pr;
  font-size: 12 * @pr;
  line-height: 18 * @pr;
  color: @antTextGrey;
}

.reset-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44 * @pr;
  padding: 11 * @pr 0;
  margin-bottom: 12 * @pr;
  border: 1px solid @antLineGrey;
  border-radius: 6 * @pr;
  color: @antTextGrey;
  text-align: center;
  font-size: 14 * @pr;
}

.warning {
  margin: 0;
  font-size: 12 * @pr;
  line-height: 18 * @pr;
  color: @antTextLight;
}
</style>
