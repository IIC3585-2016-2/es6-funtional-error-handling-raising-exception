# Manejo de Errores en Programación Funcional

La programación funcional se caracteriza la falta de estados de variables mediante la mutación de ellas a través de funciones. Esto se logra mediante la composición y encadenación sucesiva de funciones sobre los datos trabajados. Lamentablemente, en JavaScript el manejo de errores viene heredado de la programación imperativa (el clásico `try-catch` ) y contradice muchas de las metas a la que apunta la programación funcional. Las fuentes principales de este problema son el **lanzamiento de excepciones** y la aparición de nulos inesperados(**`null`** y **`undefined`**). Además, al trabajar con JavaScript no se pueden ignorar este tipo de situaciones al utilizar regularmente serviciones remotos que pueden o no devolver lo que se espera.

### ¿Por qué no arrojar excepciones en programación funcional?
* **No pueden ser encadenadas o compuestas** como las funciones.
* Violan el principio de transparencia de la programación funcional, que asegura un único valor de salida al evaluar una función, **las excepciones brindan una salida alternativa a una función**.
* **Causa efectos secundarios** al detener el sistema completo donde ocurre, más allá de la llamada de la función.
* **Cambia la localidad del código** ya que al manejar la aparición de una excepción, se sale del contexto de la función.
```javascript
try {
	var resultado = findPokemon('Pikachu');
	// Código principal...
}
catch (e) {
	console.log('ERROR: Pokemón no encontrado');
	// Manejo del error, contexto distinto.
}

```
* **Agregan responsabilidad** al tener que preocuparse de declarar bloques de manejo de excepción además del resultado de una función
* Crean situaciones dificiles de controlar cuando surgen bloques **`try-catch` anidados**.
```javascript
var pokemon = null;
try {
	pokemon = findPokemon('Pikachu');
}
catch (e) {
 	console.log('ERROR: Pokemon no encontrado.');
 	try {
		pokemon = findPokemonByID("25");
 	}
	catch (e) {
		console.log('ERROR: Pokemon no existe!');
	}
}

```

Es por esto que es necesario trabajar alrededor de ellos, y se aprovecha un patrón de diseño de programación funcional y ES6 para quitar complejidad a la escritura de código.
> We need to work smarter, not harder.

Con este fin, es necesario introducir algunos conceptos: **Functors** y **Monads**

## Functors

Son estructuras de datos capaces de usar el metodo `map`. Es decir, son **contenedores** de valores y son capaces de **aplicar funciones** sobre estos valores, y **retornar el resultado** dentro de otro contendor del mismo tipo.
El functor más famoso es `Array`.

```javascript
const pokemon = name => new Pokemon(name);
var pokemones = [
	pokemon('Bulbasaur'),
	pokemon('Charmander'),
	pokemon('Squirtle')
];
pokemones.map( p => p.evolve() );
/*[
	pokemon('Ivysaur'),
	pokemon('Charmeleon'),
	pokemon('Wartortle')
]*/
```
Algunas caracteristicas de functors son:

* No deben generar efectos secundarios.

* Se pueden componer. Componer funciones en un map es equivalente a encadenar map seguidos.

```javascript
const evolve = p => p.evolve();
const evolvex2 = p => evolve(evolve(p));
var functor = [pokemon('Charmander')];
functor.map(evolvex2); //[pokemon('Charizard')]
functor.map(evolve).map(evolve); //[pokemon('Charizard')]
```
La estructura general de un functor se encuentra en [`functor.js`](https://github.com/IIC3585-2016-2/es6-funtional-error-handling-raising-exception/blob/master/src/functor.js). Y se utiliza para contener valores no seguros y trabajar con el contenedor, que es "seguro". Pasa a ser un patron el utiliza funciones que retornan valores "seguros".
```javascript
const findPokemon = nombre => Wrapper.of(find(nombre));
const level = p => Wrapper.of(p).map(p => p.level);
```
Pero origina una complicación al componer este tipo de funciones que intentan empaquetar objetos "seguros"
```javascript
const findLevel = nombre => level(findPokemon(nombre));

findLevel('Pikachu'); // Wrapper(Wrapper(15))
```

**Pero functors solos no nos sirven tanto, ya que no se espera que manejen nulos ni excepciones. Entran los Monads.**


## Monads

Los Monads son similares a los functors, pero arreglan este último detalle de la composición mediante un metodo `join`. Además, pueden agregar lógica especial para manejar ciertos casos del valor que contienen. Existen al usar la idea de crear un tipo de dato que contiene otro y definir reglas de contención.

El archivo [`monad.js`](https://github.com/IIC3585-2016-2/es6-funtional-error-handling-raising-exception/blob/master/src/monads.js) contiene nuestro functor anterior pero con el metodo `join` implementado que colapsa todas las capas de contención en una:

```javascript
findLevel('Pikachu').join(); // Wrapper(15)
```
![](https://i.imgur.com/bt8VWQF.png)

Al ser tipos de datos libres de implementación, existen infinitos tipos. Existen algunos conocidos para los casos que nos interesan:

### Tipo of Monads

### Maybe - Manejo de Nulos

`Maybe` es una clase padre de 2 subclases, `Just` y `Nothing` que son implementaciones de Monads. En [`monads.js`](https://github.com/IIC3585-2016-2/es6-funtional-error-handling-raising-exception/blob/master/src/monads.js) hay una implementación de ellos. Estos se comportan como los contenedores que hemos hablado, para un valor que puede o no estar. Cuando el valor existe es `Just(valor)` pero cuando no, `Nothing`. Ambas tienen sus impementaciones de `map`, `join` que permiten trabajar con los valores sin que se levanten excepciones por trabajar con nulos que pueden aparecer. Puede utilizarse al trabajar con servicios remotos, como consultar una base de datos que puede o no retornar un valor. Permite también evitarse el chequeo de nulos constantes en código.

```javascript
const findPokemonDB = nombre => Maybe.fromNullable(findPokemon(nombre));
findPokemonDB('Pikachu').map(evolve).getOrElse(pokemon('Pikachu'));
// Si findPokemonDB retorna algo, lo encapsula en Just(pokemon(Pikachu))
//  y getOrElse retorna pokemon(Raichu).
// Si findPokemonDB falla, retorná Nothing
// y getOrElse retorna pokemon(Pikachu).
```
`Maybe` aparece en otros lenguajes, como `Option` y `Optional` en Java 8, con `Some` y `None` en vez de `Just` y `Nothing`. También está implementado en lenguajes funcionales como tal en Haskell. Referencia a una implementación de [Maybe. Never Null Again](https://github.com/chrissrogers/maybe) en JavaScript.

### Either - Manejo de Excepciones

Es un poco distinto a `Maybe`, pero permite recuperar información de un posible error que ocurra en el transcurso de las operaciones. Define 2 posibles estados de un valor: `Left` que puede contener un objeto de error o mensaje de error y `Right` que contiene un valor exitoso. `Right` efectivamente aplica las funciones que se le entregan al objeto, en caso de un error, se crea un objeto `Left` con el error que ignora las funciones que se le entregan.


![](https://i.imgur.com/lzjJPyc.png)

![](https://i.imgur.com/Fy8HCDB.png)

Como vemos en la figura, un clasico pipeline de programación funcional con sucesivas funciones aplicadas sobre un valor contenido. El primero es el happy-path donde todo funciona correctamente, mientras que el segundo al aparecer un error repentino por un `null`, salta todas las funciones que van despues e incluso al final es capaz de recuperar el error ocasionado.
## Relacionados

### Lift - Contenedores para funciones generales.

Para evitar tener que crear un `Maybe` o `Either` para asegurar valores en **cada** función de un programa, pueden crearse funciones `lift` que al componerse con funciones regulares, crea Monads que contengan su resultado.

```javascript
const lift = f => value => Maybe.fromNullable(value).map(f);
const f1 = v => ... ;
const f1segura = lift(f1);

f1segura(valor) // Just(valor) o Nothing.
```

### Promesas

Como tal vez se hayan dado cuenta, las promesas también son un tipo de Functor, pero con `map` llamado `then`. `then` retorna siempre otra promesa o un error que se atrapa con otro metodo llamado `catch`. De modo que para llamadas async usando promesas también es posible encadenar metodos de manera funcional y tratando excepciones en el camino:

```javascript
findPokemonPromise()
		.then(catchIt)
		.then(nameIt("Spot"), tryAgain) //En caso de error ignora nameIt y llama tryAgain
		.then(giveCandy)
		.catch(runAway) //En caso de error todo then es ignorado hasta el primer catch.

```
Como vemos se comporta de manera parecida a los Monads anteriores pero con sus propias reglas de contención.

# Resumen
* El alzar excepciones resulta en funciones impuras que van en contra de la programación funcional y agregan responsabilidad y complejidad al programador.
*  El patrón de contenedores se usa para aplicar funciones sobre valores que pueden o no estar. Los functors se usan para aplicar estas funciones sobre objetos sin efectos secundarios y sin mutaciones.
* Monads son un patron de diseño de la programación funcional que reduce la complejidad de la aplicación al generar un flujo seguro de datos que no levanta errores.
* Ya existen implementaciones de monads con el fin de evitar manejo de nulos (`Maybe`) y el manejo de excepciones (`Either`).
* Las promesas de JavaScript ya permiten cierto manejo de errores para procesos async.

# Referencias
Links de fuentes utilizadas investigando del tema y de interes para aventurarse aún más.
* [Functional Programming in JavaScript - Chapter 5 (figuras usadas)](https://www.manning.com/books/functional-programming-in-javascript)
* [Funtional JavaScript - What is a functor?](https://templecoding.com/blog/2016/06/16/functional-javascript-what-is-a-functor/)
* [Implementación de Maybe en JavaScript](https://github.com/chrissrogers/maybe)
* [ES6-Async-Hooli sección Promesas](https://github.com/IIC3585-2016-2/ES6-Async-Hooli/blob/master/async.md)
* [JavaScript Promises Error and Handling](http://odetocode.com/blogs/scott/archive/2015/10/01/javascript-promises-and-error-handling.aspx)
* [Promises are the Monads of Asynchronous Programming](https://blog.jcoglan.com/2011/03/11/promises-are-the-monad-of-asynchronous-programming/)
