const a = new Promise((resolve, reject) => {
  console.log('a')

  resolve(1)
})

const b = a.then(() => {
  console.log('b')
  // const a = 1
  // a = 3
  return d
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
