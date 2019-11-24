const noop = ()=> {}
const log = console.log

function MyPromise(excutor) {
  this.val = null
  this.nextTicks = {
    y: noop,
    n: noop
  }
  excutor(this.relsove.bind(this))
}
// 本质是对结果进行处理（存起来，并调用下一个promise）
MyPromise.prototype.relsove = function (output) {
  // log(output)
  setTimeout(() => {
    if(output instanceof MyPromise) {
      
      output.then(lastOutput => {
        this.val = lastOutput
        this.nextTicks.y(this.val)
      })
    } else {
      this.val = output
      this.nextTicks.y(this.val) // next input
    }
  }, 0)
}

MyPromise.prototype.then = function (bindFuncY, bindFuncN) {
  return new MyPromise((resolve, reject) => {
    this.nextTicks.y = (input) => {
      const output = bindFuncY(input)
      // log(output)
      resolve(output)
    }
    this.nextTicks.n = ()=> {
      const errorReson = bindFuncN()
      this.val = errorReson
      reject(errorReson)
    }
  })
}

var demo = new MyPromise((resolve, reject) => {
  log('01')
  resolve(1)
}).then((val) => {
  return new MyPromise((res) => {
    log('02', val)
    res(2)
  })
  .then(l => {
    log('03', l)
    return 3
  })
}).then((val) => {
  // log(val)
  log('04', val)

  return 4
})

