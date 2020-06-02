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

            resolve(x)
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

const a = new PromiseA((resolve, reject) => {
  console.log('a')

  resolve(1)
})

const b = a.then(() => {
  console.log('b')
  // const a = 1
  // a = 3
  return b
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
  return 4
}, e => {
  console.log(5, e)
  return 0
})

var e = d.then((val) => {
  console.log('e', val)
  return 5
}, e => {
  console.log(6, e)
})

