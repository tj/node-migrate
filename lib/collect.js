'use-strict'

module.exports = function collect (val, memo) {
  memo.push(val)
  return memo
}
