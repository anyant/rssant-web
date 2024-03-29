<template>
    <div class="feed-list" :class="{ 'mobile': isMobile, 'wide': !isMobile }">
        <div class="list-placeholder-wrapper" v-if="isLoading">
            <div class="list-placeholder spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>
        </div>
        <transition-group class="list" name="list" tag="div" v-if="!isLoading && !isEmpty">
            <MoFeedItem class="feed-item" :class="{ 'active': isActiveFeed(feed.id) }" v-for="feed in feedList"
                :key="feed.id" :title="feed.title" :number="feed.total_storys"
                :date="feed.dt_latest_story_published || feed.dt_created" :link="feed.id" :routeTo="onClickFeed">
            </MoFeedItem>
        </transition-group>
        <template v-if="!isLoading && isEmpty">
            <div class="empty-notice">
                <div class="line line1">无公开的订阅</div>
            </div>
        </template>
    </div>
</template>


<script>

import { publishFeedStore } from '@/publish/store/feed'
import MoFeedItem from '@/components/MoFeedItem'

export default {
    components: { MoFeedItem },
    props: {
        currentFeedId: {
            type: String,
        },
        isMobile: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        feedList() {
            return publishFeedStore.feedList
        },
        isLoading() {
            return publishFeedStore.isLoading
        },
        isEmpty() {
            return this.feedList.length <= 0
        },
    },
    methods: {
        isActiveFeed(feedId) {
            return feedId === this.currentFeedId
        },
        async onClickFeed(feedId) {
            if (feedId === this.currentFeedId) { return }
            this.$router.push({ query: { feed: feedId } })
        },
    }
}
</script>


<style lang="less" scoped>
@import '~@/styles/common';

.empty-notice {
    font-size: 20*@pr;
    text-align: center;
    color: @antTextLight;
    margin-top: 120*@pr;
}

.feed-list {
    padding-bottom: 8*@pr;
    position: relative;

    .feed-item {
        cursor: pointer;
    }

    &.wide {
        .feed-item {
            &:hover {
                background: lighten(@antFibre, 16%);
            }

            &.active {
                background: lighten(@antFibre, 12%);
            }
        }
    }

    &.mobile {
        .feed-item {
            margin-top: 8 * @pr;
        }
    }
}

.list-placeholder-wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
}

.list-placeholder {
    margin: auto;
    opacity: 0.33;
}

/** https://tobiasahlin.com/spinkit/ */
.spinner {
    width: 70px;
    text-align: center;
}

.spinner>div {
    width: 18px;
    height: 18px;
    background-color: darken(@antBackGrey, 20%);
    border-radius: 100%;
    display: inline-block;
    -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.spinner .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
}

.spinner .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
}

@-webkit-keyframes sk-bouncedelay {

    0%,
    80%,
    100% {
        -webkit-transform: scale(0);
    }

    40% {
        -webkit-transform: scale(1);
    }
}

@keyframes sk-bouncedelay {

    0%,
    80%,
    100% {
        -webkit-transform: scale(0);
        transform: scale(0);
    }

    40% {
        -webkit-transform: scale(1);
        transform: scale(1);
    }
}

.list-enter-active,
.list-leave-active {
    transition: all 1s ease;
}

.list-enter,
.list-leave-to {
    opacity: 0;
}
</style>