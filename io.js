const {liftF, Pure, Impure} = require('./free')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class ReadLine {
  constructor(cont) {
    this.cont = cont
  }
  map(f) {
    return new ReadLine(s => f(this.cont(s)))
  }
}

class PrintLine {
  constructor(s, a) {
    this.s = s
    this.a = a
  }
  map(f) {
    return new PrintLine(this.s, f(this.a))
  }
}

function readLine() {
  return liftF(new ReadLine(s => s))
}

function printLine(s) {
  return liftF(new PrintLine(s, undefined))
}

function run(free, done) {
  while (true) {
    if (free instanceof Pure) {
      done(free.a)
      break
    } else if (free instanceof Impure) {
      let m = free.m()
      if (m instanceof ReadLine) {
        rl.once('line', (line) => run(m.cont(line), done))
        break
      } else {
        console.log(m.s)
        free = m.a // tail recursion
      }
    } else { // FlatMap
      let {s, f} = free
      if (s instanceof Pure) {
        free = f(s.a)
      } else if (s instanceof Impure) {
        let sm = s.m()
        if (sm instanceof ReadLine) {
          rl.once('line', (line) => run(sm.cont(line).flatMap(f), done))
          break
        } else {
          console.log(sm.s)
          free = f(sm.a)
        }
      } else { // FlatMap
        free = s.s.flatMap((a) => s.f(a).flatMap(f))
      }
    }
  }
}

module.exports = {
  readLine, printLine, run
}