<template>
    <MoLayout header>
        <MoBackHeader>
            <template v-slot:title>发布订阅</template>
            <mu-button flat class="action-guide" @click="openGuideDialog">
                <fa-icon icon="info-circle" :size="16" :color="antGold" />
                <span class="guide-button-text">配置说明</span>
            </mu-button>
        </MoBackHeader>
        <div class="main">
            <div class="section-publish-config">

                <div class="config-item">
                    <mu-switch class="input-is-enable" :inputValue="publishConfig.is_enable" label-left label="开启发布订阅功能"
                        @change="onSetIsEnable"></mu-switch>
                </div>

                <div class="config-item" v-if="publishConfig.is_enable">
                    <div class="title-root-url">
                        <label class="label">自定义网址</label>
                    </div>
                    <div class="form-root-url">
                        <mu-text-field class="input" placeholder="例如：https://www.example.com" full-width
                            v-model="form.root_url" :error-text="form.root_url_error">
                        </mu-text-field>
                        <span class="item-button item-button-save" @click="onSetRootUrl">
                            <fa-icon class="item-button-icon" :color="antTextWhite" icon="save" />保存
                        </span>
                    </div>
                </div>

                <div class="config-item" v-if="publishConfig.is_enable">
                    <div class="title-website-title">
                        <label class="label">网站标题</label>
                    </div>
                    <div class="form-website-title">
                        <mu-text-field class="input" placeholder="你的网站标题" full-width v-model="form.website_title"
                            :error-text="form.website_title_error">
                        </mu-text-field>
                        <span class="item-button item-button-save" @click="onSetWebsiteTitle">
                            <fa-icon class="item-button-icon" :color="antTextWhite" icon="save" />保存
                        </span>
                    </div>
                </div>

                <div class="config-item config-publish-mode" v-if="publishConfig.is_enable">
                    <mu-radio class="input-publish-mode" :inputValue="!!publishConfig.is_all_public" :value="true"
                        label="全部公开发布" @click="onSetAllPublic(true)"></mu-radio>
                    <mu-radio class="input-publish-mode" :inputValue="!!publishConfig.is_all_public" :value="false"
                        label="选择部分公开" @click="onSetAllPublic(false)"></mu-radio>
                </div>
            </div>
            <MoPublishConfigFeedList class="section-feed-list" v-if="isShowFeedList">
            </MoPublishConfigFeedList>
        </div>
        <mu-dialog fullscreen scrollable :padding="0" :open.sync="isGuideDialogOpen">
            <mu-appbar z-depth="0" color="#ffffff" text-color="#000000" title="配置说明">
                <mu-button class="button-close" slot="right" :color="antBlue" flat @click="closeGuideDialog">
                    <fa-icon icon="times" :size="20" :color="antBlue"></fa-icon>
                    <span class="button-text">关闭</span>
                </mu-button>
            </mu-appbar>
            <div class="guide-main markdown-body">
                <p>发布订阅功能用于公开你的订阅，让网友可以在指定的网址上看到你的订阅内容。</p>
                <p>开启此功能后，你还需要在你的服务器上配置请求转发才能生效。</p>
                <p>
                    <span>当请求访问你指定的网址时，将请求转发到蚁阅地址</span>
                    <code>{{ publishTarget }}</code>
                    <span>同时带上请求头</span>
                    <code>{{ publishHeader }}</code>
                    <span>，蚁阅服务器会根据此请求头展示你发布的订阅。</span>
                </p>
                <h4>Nginx配置</h4>
                <pre>{{ nginxConfig }}</pre>
                <h4>Caddy配置</h4>
                <pre>{{ caddyConfig }}</pre>
            </div>
        </mu-dialog>
    </MoLayout>
</template>

<script>
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoPublishConfigFeedList from '@/components/MoPublishConfigFeedList'
import { userPublishStore } from '@/store/userPublish'
import { feedStore } from '@/store/feed'
import { antBlue, antGold, antTextWhite } from '@/plugin/common'

export default {
    name: 'MoPublishConfigPage',
    components: {
        MoBackHeader,
        MoLayout,
        MoPublishConfigFeedList,
    },
    data() {
        return {
            antTextWhite,
            antBlue,
            antGold,
            isGuideDialogOpen: false,
            form: {
                root_url: null,
                root_url_error: null,
                website_title: null,
                website_title_error: null,
            },
        }
    },
    computed: {
        publishConfig() {
            return userPublishStore.config
        },
        isShowFeedList() {
            return this.publishConfig.is_enable && !this.publishConfig.is_all_public
        },
        publishUrl() {
            return this.publishConfig.root_url || 'https://rss.example.com'
        },
        publishTarget() {
            return 'https://rss.anyant.com'
        },
        publishHeaderValue() {
            return userPublishStore.config.unionid || 'your-publish-id'
        },
        publishHeader() {
            return `X-Rssant-Publish: ${this.publishHeaderValue}`
        },
        nginxConfig() {
            return `
server {
    listen 80;
    server_name  _;

    location = / {
        return 302 /rssant/;
    }

    location / {
        proxy_pass https://rss.anyant.com;
        proxy_set_header Host "rss.anyant.com";
        proxy_set_header X-Rssant-Publish "${this.publishHeaderValue}";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`.trim()
        },
        caddyConfig() {
            return `
:80 {
    handle / {
        redir / /rssant/
    }

    handle {
        reverse_proxy https://rss.anyant.com {
            header_up Host "rss.anyant.com"
            header_up X-Rssant-Publish "${this.publishHeaderValue}"
        }
    }
}
`.trim()
        },
    },
    async mounted() {
        await userPublishStore.doLoad()
        this.form.root_url = this.publishConfig.root_url
        this.form.website_title = this.publishConfig.website_title
        await feedStore.sync()
    },
    methods: {
        openGuideDialog() {
            this.isGuideDialogOpen = true
        },
        closeGuideDialog() {
            this.isGuideDialogOpen = false
        },
        async onSetIsEnable(value) {
            await userPublishStore.doSave({ is_enable: value })
            this.$toast.success({ message: '设置保存成功' })
        },
        async onSetRootUrl() {
            try {
                await userPublishStore.doSave({ root_url: this.form.root_url })
            } catch (ex) {
                this.form.root_url_error = ex.message
                return
            }
            this.form.root_url_error = null
            this.$toast.success({ message: '设置保存成功' })
        },
        async onSetWebsiteTitle() {
            try {
                await userPublishStore.doSave({ website_title: this.form.website_title })
            } catch (ex) {
                this.form.website_title_error = ex.message
                return
            }
            this.form.website_title_error = null
            this.$toast.success({ message: '设置保存成功' })
        },
        async onSetAllPublic(value) {
            await userPublishStore.doSave({ is_all_public: value })
            this.$toast.success({ message: '设置保存成功' })
        },
    }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.action-guide {
    position: relative;
    right: -12*@pr;

    .guide-button-text {
        margin-left: 3*@pr;
        color: @antGold;
    }
}

.button-close {
    position: relative;
    right: -4*@pr;

    .button-text {
        font-size: 18*@pr;
        margin-left: 2*@pr;
    }
}

.guide-main {
    padding: 16*@pr;
    height: 100%;
    overflow-y: auto;
    overflow-x: auto;
}


.main {
    padding-top: 8*@pr;
}

.section-publish-config {
    padding-left: 16*@pr;
    padding-right: 16*@pr;

    .input-is-enable {
        & /deep/ .mu-switch-label {
            color: @antTextBlack;
            font-size: 16*@pr;
            font-weight: bold;
            margin-right: 16*@pr;
        }
    }

    .title-website-title,
    .title-root-url {
        .label {
            font-size: 16*@pr;
            color: @antTextBlack;
            font-weight: bold;
        }
    }

    .title-root-url {
        margin-top: 24*@pr;
    }

    .title-website-title {
        margin-top: 16*@pr;
    }

    .form-website-title,
    .form-root-url {
        display: flex;
        flex-direction: row;
        align-items: center;

        .input {
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 2*@pr;
        }

        .item-button {
            flex-shrink: 0;
            padding: 2*@pr 8*@pr;
            margin-left: 16*@pr;
            font-size: 16*@pr;
            background: @antBlue;
            color: @antTextWhite;
            cursor: pointer;
            border-radius: 8*@pr;
            margin-bottom: 16*@pr;

            .item-button-icon {
                margin-right: 4*@pr;
            }
        }
    }

    .config-publish-mode {
        margin-top: 12*@pr;

        .input-publish-mode {
            margin-left: 32*@pr;

            &:first-child {
                margin-left: 0;
            }

            & /deep/ .mu-radio-label {
                color: @antTextBlack;
                font-size: 16*@pr;
                font-weight: bold;
            }
        }
    }
}

.section-feed-list {
    margin-top: 16*@pr;
}
</style>