const PromiseA = require('./index')

log = console.log
var demo = new PromiseA((resolve, reject) => {
  const r = 0
  r = 1
  resolve(1)

}).then(1, 2).then(() => {
  console.log(11)
  return new PromiseA((resolve) => {
    console.log('y')
    resolve('y4')
  })
}, () => {
  console.log(22)
  return new PromiseA((resolve) => {
    console.log('n')
    resolve('n4')
  })
}).then((val) => {
  console.log(val)
})