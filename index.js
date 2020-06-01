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
    if (this.statu !== PENDING) {
      console.log(this.statu)
      // throw new Error('')
    }
    this.handleFulfilled(val)

    defer(() => {
      // 2.2.2.1 it must be called after promise is fulfilled, with promise’s value as its first argument.
      this.onFulfilledCallbacks.forEach(onFulfilledWrapper => {
        onFulfilledWrapper(val)
      })
    })
  }

  reject(reason) {
    // console.log('reason:', reason)
    this.handleRejected(reason)
    defer(() => {
      this.onRejectedCallbacks.forEach(onRejectdWrapper => {
        onRejectdWrapper(reason)
      })
    })
  }

  // 2.2.1 Both onFulfilled and onRejected are optional arguments:
  then(onFulfilled, onRejected) {
    // 2.2.7 then must return a promise
    return new PromiseA((resolve, reject) => {

      //2.2.1.1  If onFulfilled is not a function, it must be ignored.
      if (!isFunction(onFulfilled)) {
        //2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
        onFulfilled = () => onFulfilled
      }
      //2.2.1.2  If onRejected is not a function, it must be ignored.
      if (!isFunction(onRejected)) {
        onRejected = () => onRejected
      }

      this.onFulfilledCallbacks.push(val => {
        try {
          //2.2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
          resolve(onFulfilled(val))
        } catch (e) {
          //2.2.7.2 If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
          // res = e
          reject(e)
        }
      })

      this.onRejectedCallbacks.push(reason => {
        try {
          //2.2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
          resolve(onRejected(reason))
        } catch (e) {
          reject(e)
        }
      })
    })
  }
}

const a = new PromiseA((resolve, reject) => {
  console.log('a')

  resolve(1)
})

const b = a.then((val) => {
  console.log('b', val)

  const a = 1
  a = 3
  return 2
}, e => {
  console.log(3, e)
})

const c = b.then((val) => {
  console.log('c', val)
  return 3
}, e => {
  console.log(4, e)
  return 0
})

const d = c.then((val) => {
  console.log('d', val)
  return 3
}, e => {
  console.log(5, e)
})

