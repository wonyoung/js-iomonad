const readline = require('./readline')

class Pure {
  // a :: A
  constructor(a) {
    this.a = a
  }
  // f :: A -> Free[B]
  // this.a :: A
  // f(this.a) :: Free[B]
  flatMap(f) {
    return f(this.a)
  }
}

class Impure {
  // m :: IO[A]
  constructor(m) {
    this.m = m
  }
  // f :: A -> Free[B]
  // this.m :: IO[A]
  // this.m.map :: (A -> Free[B]) -> IO[B]
  // this.m.map(f) :: IO[B]
  // new Impure(this.m.map(f)) :: Free[B]
  flatMap(f) {
    return new Impure(this.m.map(f))
  }
}

class PrintLine {
  // s :: String
  // a :: Free[A]
  constructor(s, a) {
    this.s = s
    this.a = a
  }
  // f :: A -> Free[B]
  // this.a :: Free[A]
  // this.a.flatMap:: (A -> Free[B]) -> Free[B]
  // this.a.flatMap(f) :: Free[B]
  map(f) {
    return new PrintLine(this.s, this.a.flatMap(f))
  }
}

class ReadLine {
  // cont :: String -> Free[A]
  constructor(cont) {
    this.cont = cont
  }
  // f :: A -> Free[B]
  // x :: String
  // this.cont :: String -> Free[A]
  // this.cont(x) :: Free[A]
  // this.cont(x).flatMap(f) :: Free[B]
  map(f) {
    return new ReadLine(x => this.cont(x).flatMap(f))
  }
}

function printLine(s) {
  // s :: String
  return new Impure(new PrintLine(s, new Pure()))
}

function readLine(cont) {
  // cont :: String -> B
  return new Impure(new ReadLine(x => new Pure(cont(x))))
}

function run(free, done) {
  if (free instanceof Pure) {
    done(free.a)
  } else if (free instanceof Impure) {
    if (free.m instanceof PrintLine) {
      console.log(free.m.s)
      run(free.m.a, done)
    } else if (free.m instanceof ReadLine) {
      readline(line => run(free.m.cont(line), done))
    } else {
      throw 'Unknown type'
    }
  } else {
    throw 'Unknown type'
  }
}

var prog0 = printLine('hello world')
var prog1 = printLine('hello')
  .flatMap(() => printLine(' world')
    .flatMap(() => printLine('have a nice day!')))

var prog2 = readLine(name => console.log(name))
var prog3 = printLine('your name?')
  .flatMap(() => readLine(s => s)
    .flatMap(name => printLine('hello ' + name)))
var prog4 = printLine('your name?')
  .flatMap(() => readLine(s => s)
    .flatMap(name => printLine('age ?')
      .flatMap(() => readLine(s => parseInt(s))
        .flatMap(age => printLine('Hello '+name+(age < 30 ? ', young man':''))))))

run(prog4, () => {
  console.log('done')
  process.exit(0)
})
