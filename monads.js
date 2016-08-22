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

  join(){
    if(!(this._value instanceof Wrapper)){
      return this;
    }
    return this._value.join();
  }

  toString(){
    return `Wrapper ${this._value}`;
  }
}

//const times = (value => value * 2);
const wrap = value => new Wrapper(value)
var dos = wrap(2)
var dosWrapped = wrap(dos)
console.log(dosWrapped)
console.log(dosWrapped.join())
/*
var dos = wrap(2);
console.log(dos.toString())
*/
