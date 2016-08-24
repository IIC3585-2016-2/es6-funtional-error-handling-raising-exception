class Maybe{
  static fromNullable(a){
    return a !== null && a !== undefined ? Maybe.just(a) : Maybe.nothing()
  }

  static just(a){
    return new Just(a);
  }
  static nothing(){
    return new Nothing();
  }

  static of(a){
    return Maybe.just(a)
  }
  get isNothing(){
    return false;
  }
  get isJust(){
    return false
  }
}

class Just extends Maybe {
  constructor(value){
    super();
    this._value = value;
  }
  get value()
  {
    return this._value;
  }
  map(f){
    return Maybe.of(f(this._value))
  }
  getOrElse(){
    return this._value;
  }
  filter(f){
    Maybe.fromNullable(f(this.value) ? this.value : null);
  }
  get isJust(){
    return true;
  }
  toString(){
    return `Maybe.Just(${this.value})`;
  }
}

class Nothing extends Maybe {
  map(f){
    return this;
  }

  get value() {
    throw new TypeError("Can't extract the value of a Nothing.");
  }
  getOrElse(other){
    return other;
  }
  filter(){
    return this.value
  }

  get isNothing(){
    return true;
  }
  toString(){
    return `Maybe.Nothing`;
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
const capture = poke => {pokemon = (Maybe.fromNullable(poke))}
const getName = poke => poke.name
find(25).then(function(row){
  capture(row[0])
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
