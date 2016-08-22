class Wrapper {
  constructor(value){
    this._value = value;
  }

  static of(a){
    return new Wrapper(a);
  }

  map(f){
    return Wrapper.of(f(this._value));
  }

  toString(){
    return `Wrapper ${this._value}`;
  }
}

const times = (value => value * 2);
const wrap = value => new Wrapper(value)
var dos = wrap(2);
console.log(dos.map(times))
console.log(dos)
