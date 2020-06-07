const PromiseA = require('./index')

log = console.log
var demo = new Promise((resolve, reject) => {
  r = 1
  resolve(1)
  reject(2)
})