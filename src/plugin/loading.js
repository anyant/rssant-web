import _ from 'lodash'

class Loading {

    constructor() {
        this.hasBegin = false
        this.isLoading = false
        this.isFinished = false
        this.isResolved = false
        this.isRejected = false
        this.promise = null
    }

    begin(executor) {
        if (!_.isFunction(executor)) {
            throw new Error('Parameter executor must be a function')
        }
        if (this.hasBegin) {
            return this.promise
        }
        let promise = executor()
        if (!(_.isFunction(promise.then) || _.isFunction(promise.catch) || _.isFunction(promise.finally))) {
            throw new Error('Parameter executor must return a Promise object')
        }
        this.promise = promise
        this.hasBegin = true
        this.isLoading = true
        return new Promise((resolve, reject) => {
            this.promise.then(result => {
                this.isResolved = true
                resolve(result)
            }).catch(error => {
                this.isRejected = true
                reject(error)
            }).finally(() => {
                this.isLoading = false
                this.isFinished = true
            })
        })
    }

    reset() {
        this.hasBegin = false
        this.isLoading = false
        this.isFinished = false
        this.isResolved = false
        this.isRejected = false
        this.promise = null
    }

}


export default Loading