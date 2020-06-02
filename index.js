function isFunction(param) {
  return typeof param === "function"
}

// 难点在于2.2.7，仔细看88行和107行

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

  handleFulfilled(val) {
    // 2.1.2 When fulfilled, a promise:
    //  2.1.2.1 must not transition to any other state.
    //  2.1.2.2 must have a value, which must not change.
    this.value = val
    this.statu = FULFILLED
    Object.freeze(this)
  }
  // 2.1.2 When rejected, a promise:
  //  2.1.2.1 must not transition to any other state.
  //  2.1.2.2 must have a reason, which must not change.
  handleRejected(reason) {
    this.value = reason
    this.statu = REJECTED
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
    const promise = new PromiseA((resolve, reject) => {
      // 2.2.1.1  If onFulfilled is not a function, it must be ignored.
      this.onFulfilledCallbacks.push(val => {
        if (this.statu !== FULFILLED) return

        try {
          if (isFunction(onFulfilled)) {
            //2.2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
            //2.2.5 onFulfilled and onRejected must be called as functions 
            const x = onFulfilled(val)

            // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
            if (promise === x) {
              return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
            }
            if (x instanceof PromiseA) {
              // 2.3.2 If x is a promise, adopt its state
              promise.statu = x.statu
              // 2.3.2.2 If/when x is fulfilled, fulfill promise with the same value.
              // 2.3.2.3 If/when x is rejected, reject promise with the same reason.
              x.then(value => resolve(value), reason => reject(reason))
            } else {
              resolve(x)
            }
          } else {
            // 2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
            resolve(this.value)
          }
        } catch (e) {
          //2.2.7.2 If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
          reject(e)
        }
      })

      // 2.2.1.2  If onRejected is not a function, it must be ignored. ???
      this.onRejectedCallbacks.push(reason => {
        if (this.statu !== REJECTED) return

        try {
          if (isFunction(onRejected)) {
            //2.2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
            //2.2.5 onFulfilled and onRejected must be called as functions 
            resolve(onRejected(reason))
          } else {
            // 2.2.7.4 If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1.
            reject(this.value)
          }

        } catch (e) {
          //2.2.7.2 If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
          reject(e)
        }
      })
    })


    return promise
  }
}
log = console.log
var demo = new PromiseA((resolve, reject) => {
  defer(() => {
    log('01')
    resolve(1)
  })
}).then((val) => {
  return new PromiseA((res) => {
    log('02', val)
    res(2)
  })
    .then(l => {
      log('03', l)
      return 3
    })
}).then(4).then(val => {
  log('05', val)
  return 5
})

