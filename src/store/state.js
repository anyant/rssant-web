import Loading from '@/plugin/loading'

export default {
    user: {
        loading: new Loading(),
        loginUser: null,
        loginToken: null,
        loginDate: null,
    },
    feed: {
        loading: new Loading(),
        feeds: {},
        feedList: [],
        feedStoryMap: {},
        offsetLow: {},
        offsetHigh: {},
    },
    story: {
        storys: {},
    },
    page: {
        scrollTop: {},
    }
}
