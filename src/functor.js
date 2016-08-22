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

const wrap = value => new Wrapper(value);
const sumar = x1 => x2 => x1 + x2;
const cuadrado = x1 => x1*x1
const dividir = x1 => x2 => x2/x1;

/* */
var dos = wrap(2)
var cinco = dos.map(sumar(3))
console.log(cinco.toString())

/*Como ahora estamos trabajando con functors podemos concatenar las operaciones
de forma continua,para trabajar con el valor envuelto de forma funcional */
var valorFinal = cinco.map(cuadrado).map(sumar(10)).map(dividir(4));
console.log(valorFinal.toString())
