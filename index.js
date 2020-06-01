function isFunction(param) {
  return typeof param === "function"
}

// 2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code
function defer(...a) {
  return process.nextTick(...a)
}

// 2.1 A promise must be in one of three states: pending, fulfilled, or rejected.
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class PromiseA {
  constructor(func) {
    // 1.3 “value” is any legal JavaScript value (including undefined, a thenable, or a promise).
    this.value = null
    this.statu = PENDING
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    try {
      func(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject.call(this, e)
    }
  }
  // 2.1.2 When fulfilled, a promise:
  //  2.1.2.1 must not transition to any other state.
  //  2.1.2.2 must have a value, which must not change.
  handleFulfilled(val) {
    this.statu = FULFILLED
    this.value = val
    Object.freeze(this)
  }
  // 2.1.2 When rejected, a promise:
  //  2.1.2.1 must not transition to any other state.
  //  2.1.2.2 must have a reason, which must not change.
  handleRejected(reason) {
    this.statu = REJECTED
    this.value = reason
    Object.freeze(this)
  }

  resolve(val) {
    this.handleFulfilled(val)

    defer(() => {
      // 2.2.2.1 it must be called after promise is fulfilled, with promise’s value as its first argument.
      // 2.2.2.2 it must not be called before promise is fulfilled.
      // 2.2.2.3 it must not be called more than once.
      // 2.2.6 then may be called multiple times on the same promise.
      this.onFulfilledCallbacks.forEach(onFulfilledCaller => {
        onFulfilledCaller(val)
      })
    })
  }

  reject(reason) {
    this.handleRejected(reason)
    defer(() => {
      // 2.2.3.1 it must be called after promise is rejected, with promise’s reason as its first argument.
      // 2.2.3.2 it must not be called before promise is rejected.
      // 2.2.3.3 it must not be called more than once.
      this.onRejectedCallbacks.forEach(onRejectdCaller => {
        onRejectdCaller(reason)
      })
    })
  }

  // 2.2.1 Both onFulfilled and onRejected are optional arguments:
  then(onFulfilled, onRejected) {
    // 2.2.7 then must return a promise
    return new PromiseA((resolve, reject) => {
      // 2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
      if (!isFunction(onFulfilled) && this.statu === FULFILLED) {
        onFulfilled = () => this.value
      }
// console.log(!isFunction(onRejected) && this.statu === REJECTED)
// console.log(onRejected, this.statu)
      // 2.2.7.4 If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1.
      if (!isFunction(onRejected) && this.statu === REJECTED) {
        onRejected = () => this.value
      }

      // 2.2.1.1  If onFulfilled is not a function, it must be ignored.
      if (isFunction(onFulfilled)) {
        this.onFulfilledCallbacks.push(val => {
          try {
            //2.2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
            //2.2.5 onFulfilled and onRejected must be called as functions 
            resolve(onFulfilled(val))
          } catch (e) {
            //2.2.7.2 If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
            reject(e)
          }
        })
      }

      //2.2.1.2  If onRejected is not a function, it must be ignored.
      if (isFunction(onRejected)) {
        this.onRejectedCallbacks.push(reason => {
          try {
            //2.2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
            //2.2.5 onFulfilled and onRejected must be called as functions 
            resolve(onRejected(reason))
          } catch (e) {
            //2.2.7.2 If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
            reject(e)
          }
        })
      }
    })
  }
}

const a = new PromiseA((resolve, reject) => {
  console.log('a')

  resolve(1)
})

const b = a.then(() => {
  const a = 1
  a = 3
}, e => {
  console.log(3, e)
  return e
})

const c = b.then((val) => {
  console.log('c', val)
  return 3
}, 3)

const d = c.then((val) => {
  console.log('d', val)
  return 3
}, e => {
  console.log(5, e)
})

