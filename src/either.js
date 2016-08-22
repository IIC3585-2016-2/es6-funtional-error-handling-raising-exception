class Either {
  constructor(value) {
      this._value = value;
  }
  get value() {
    return this._value;
  }
  static left(a){
    return new Left(a)
  }
  static right(a){
    return new Right(a);
  }
  static fromNullable(val){
    return val !== null ? right(val) : left(val);
  }
  statif of(a){
    return right(a);
  }
}

class Left extends Either{
  map(_) {
    return this;
  }

  get value(){
    throw new TypeError("Can't extract the value of a Left(a).");
  }
  getOrElse(other){
    return other;
  }
  orElse(f) {
    return f(this.value);
  }
  getOrElseThrow(a){
    throw new Error(a)
  }
  filter(f){
    return this;
  }
  toString(){
    return `Either.Left(${this.value})`;
  }
}

class Right extends Either {
  map(f){
    return Either.of(f(this.value))
  }
  getOrElse(other){
    return this.value;
  }
  orElse(){
      return this;
  }
  chain(f) {
    return f(this.value);
  }
  getOrElseThrow(_) {
    return this.value
  }
  filter(f){
    return Either.fromNullable(f(this.value)? this.value : null);
  }
  toString(){
    return `Either.Right(${this.value})`;
  }
}
