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
    return val !== null ? Either.right(val) : Either.left(val);
  }
  static of(a){
    return Either.right(a);
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

var knex = require('knex')({
  dialect: 'sqlite3',
  connection: {
  filename: './pokemon.db'
  }
})
db = knex('pokemon')


const find = id => db.select('*').where({'id':id}).limit(1)
var pokemon;
const log = info => console.log(info);
const capture = function(poke){
  if (poke){
      return Either.of(poke)
  }
  return Either.left(`Pokemon not found with ID:`)
}
const getName = poke => poke.name
find(100).then(function(row){
  pokemon = capture(row[0])
  return pokemon
})
.then(function(poke){
    console.log(poke)
    return poke.map(getName)
})
.then(poke => {log(poke);return poke})
.then(poke => log(poke.value))

//find(2).then(row => {console.log(row)}).catch(e => console.log(e))
//var result = db('pokemon').select("*").where({'id':2}).then(x => console.log(x))




knex.destroy()
