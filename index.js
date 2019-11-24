function MyPromise(excutor) {
  this.value = undefined; // fulfilled状态时 返回的信息
  this.onFulfilledCallbacks = []; // 存储fulfilled状态对应的onFulfilled函数

  excutor(this.resolve.bind(this));
}

// 在每次resolve的时候，去执行promise上的绑定的方法，方法的参数就是通过resolve的参数传进去
MyPromise.prototype.resolve = function (value) {
  // setTimeout(() => {
    (() => {
    this.value = value;
    this.onFulfilledCallbacks.forEach(cb => {
      cb(this.value)
    });
  })()
  // });
}

MyPromise.prototype.then = function (onFulfilled) {
  return new MyPromise((resolve) => {
    console.log('给'+　this + '绑定方法')
    this.onFulfilledCallbacks.push((value) => {
      let x = onFulfilled(value);
      resolve(x)
    });
  });
};

module.exports = MyPromise

new MyPromise((resolve, reject) => {
  console.log('first New')
  resolve(1)
}).then((val) => {
  console.log(val)
  return 2
}).then((val) => {
  console.log(val)
  return 3
})
