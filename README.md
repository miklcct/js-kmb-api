# Javascript module for getting KMB data
This is a library for getting KMB data. It can get routes, stops, variants, and ETAs.

## Example Usage
### Loading the library
```js
// import the library class
const Kmb = require('js-kmb-api').default;

// create an API instance using the default setting
const kmb = new Kmb;

// create an API instance with caching in the browser
// It's recommended to use localStorage to cache stops, and sessionStorage to cache stop routes
// because stop names do not change often and are reloaded automatically
const kmb = new Kmb('en', localStorage, sessionStorage);
```

### Using the library
Refer to the `example-javascript.js` or `example-typescript.ts` files for the following example in a runnable form.
```js
// Load the forward route of 104
const route = (await kmb.getRoutes('104')).find(route => route.bound === 1);
if (route === undefined) {
    throw new Error('route is not found');
}

// load the main variant
const variant = (await route.getVariants()).sort((a, b) => a.serviceType - b.serviceType)[0];
if (variant === undefined) {
    throw new Error('No variants are found');
}

// Load the stop list of the main variant
const stoppings = await variant.getStoppings();

// Find a stop called "Immigration Tower"
const stopping = stoppings.find(stopping => stopping.stop.name === 'Immigration Tower');
if (stopping === undefined) {
    throw new Error('Stop is not found');
}

// Get the ETA there
const etas = await stopping.getEtas();
console.log(etas);

// Get the stoppings of all other routes for that stop
const stoppings_at_immigration_tower = await stopping.stop.getStoppings();
console.log(stoppings_at_immigration_tower);
```

To run the example, use
```shell script
node example-javascript.js # Javascript example
ts-node example-typescript.ts # Typescript example
```

## Classes
All the classes below are inside the kmb object tying them to the API instance

### `Route`
Represents a route with number and bound.
### `Stop`
Represents a stop with ID, name, direction in route and sequence in route.
The name is stored in localStorage automatically.

Calling `Stop.get` with a variant will return the stop list of that variant.

### `Stop`
Represents a stop with ID only. The name property is retrieved from localStorage by `Stop`


### `StopRoute`
Represents a stop in a variant.

Calling `StopRoute.get` with a stop will return all `StopRoute`s containing with all routes serving that stop.

### `Variant`
Represents a variant in a route.

Calling `Variant.get` with a route will return all variants of that route.

### `Eta`
Represents an ETA entry.

Calling `Eta.get` with a StopRoute will return the ETA for that stop for that route.