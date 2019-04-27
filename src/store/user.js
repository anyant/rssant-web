import _ from 'lodash'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'

export default {
    state: {
        loading: new Loading(),
        loginUser: null,
        loginToken: null,
        loginDate: null,
    },
    mutations: {
        LOGIN(state, loginUser) {
            state.loginUser = loginUser
        },
    },
    getters: {
        isLoading(state) {
            return state.loading.isLoading
        },
        isLogined(state) {
            return !_.isNil(state.loginUser)
        },
        loginUser(state) {
            return state.loginUser
        }
    },
    actions: {
        async login(DAO, { account, password } = {}) {
            if (!_.isNil(account)) {
                if (DAO.state.loading.isFinished) {
                    DAO.state.loading.reset()
                }
            }
            await DAO.state.loading.begin(async () => {
                await API.user.login({ account, password })
                    .then(user => {
                        DAO.LOGIN(user)
                    })
            })
        },
        async register(DAO, { username, email, password }) {
            await API.user.register({ username, email, password })
        },
        logout(DAO, { next } = {}) {
            API.user.logout({ next })
        },
        loginGithub(DAO, { next, scope } = {}) {
            API.user.loginGithub({ next, scope })
        },
        connectGithub(DAO, { next, scope } = {}) {
            if (!this.isLogined) { return }
            API.user.connectGithub({ next, scope })
        },
    }
}