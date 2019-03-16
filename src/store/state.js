export default {
    user: {
        isLoading: true,
        loginUser: null,
        loginToken: null,
        loginDate: null,
    },
    feed: {
        cursor: {
            hasPrev: true,
            prev: null,
            hasNext: true,
            next: null,
        },
        feeds: {
        },
    },
    story: {
        cursor: {
            prev: {},
            hasPrev: {},
            next: {},
            hasNext: {},
        },
        storys: {
        },
        feedStoryMap: {
        }
    },
}
