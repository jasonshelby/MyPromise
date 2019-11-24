const promise = require('./index');



test('adds 1 + 2 to equal 3', () => {
  expect(demo(1, 2)).toBe(3);

const demo = new MyPromise((resolve) => {
  console.log('START')
  resolve('first resolve')
})
  .then(v => {
    console.log('then 1', v)
    return 1
  })
  .then(v => {
    console.log('then 2', v)
    return 2
  })
  .then(v => {
    console.log('then 3', v)
    return 3
  })


});
