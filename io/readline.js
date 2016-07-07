var lines = []
var listeners = []
var buff = ""
process.stdin.on('data', data => {
  buff += data

  let i = 0
  let j
  while((j = buff.indexOf('\n', i)) >= 0) {
    emitLine(buff.slice(i, j))
    i = j + 1
  }
  buff = buff.slice(i)
})
function emitLine(line) {
  if (listeners.length > 0) {
    let listener = listeners.shift()
    process.nextTick(() => listener(line))
  } else {
    process.nextTick(() => lines.push(line))
  }
}
function readline(listener) {
  if (lines.length > 0) {
    let line = lines.shift()
    process.nextTick(() => listener(line))
  } else {
    process.nextTick(() => listeners.push(listener))
  }
}

module.exports = readline