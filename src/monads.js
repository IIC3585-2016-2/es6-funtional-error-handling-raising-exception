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

const wrap = value => new Wrapper(value);
const sumar = x1 => x2 => x1 + x2;
const cuadrado = x1 => x1*x1;
const dividir = x1 => x2 => x2/x1;

/*Aveces las funciones que  */
var dos = wrap(2)
var dosWrapped = wrap(dos);
console.log(dosWrapped.toString())
dosWrapped = wrap(wrap(wrap(dosWrapped)))
console.log(dosWrapped.toString())
console.log(dosWrapped.join().toString())
