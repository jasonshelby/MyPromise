const noop = () => { }
const log = console.log

const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

const nextTick = typeof setImmediate !== 'undefined' ? task => {
  setImmediate(task)
} : task => {
  setTimeout(task)
}

const MyPromise = (function () {
  // 为后续实现私有变量做准备
  // const val = new WeakMap()
  class MyPromise {
    constructor(excutor) {
      this.val = null
      this.state = PENDING
      this.deferFuncs = {
        y: [],
        n: []
      }
      excutor(this.relsove.bind(this))
    }

    // 本质是对结果进行处理（存起来，并调用下一个promise）
    relsove(output) {
      nextTick(() => {
        // then中return的值为promise，用.then的方式将这个peomise的值“接住”
        if (output instanceof MyPromise) {
          output.then(lastOutput => {
            // 当前promise的value值就是下一个then的输入值
            this.val = lastOutput
            this.deferFuncs.y.forEach(y => y(this.val))
          })
        } else {
          this.val = output
          this.deferFuncs.y.forEach(y => y(this.val)) // next input
        }
        if (!this.val) {
          log(this)
        }
      })
    }

    then(bindFuncY, bindFuncN) {
      // 如果then的参数不是函数，需要将值透传，所以返回原有参数
      bindFuncY = typeof bindFuncY === 'function' ? bindFuncY : v => v
      bindFuncN = typeof bindFuncN === 'function' ? bindFuncN : v => v

      return new MyPromise((resolve, reject) => {
        this.deferFuncs.y.push((input) => {
          const output = bindFuncY(input)
          // log(output)
          resolve(output)
        })
        this.deferFuncs.n.push(() => {
          const errorReson = bindFuncN()
          this.val = errorReson
          reject(errorReson)
        })
      })
    }

  }
  return MyPromise
})()

var demo = new MyPromise((resolve, reject) => {
  nextTick(() => {
    log('01')
    resolve(1)
  })
}).then((val) => {
  return new MyPromise((res) => {
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

