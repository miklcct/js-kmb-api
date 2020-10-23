# Javascript module for getting KMB data
This is a library for getting KMB data. It can get routes, stops, variants, and ETAs.

## Example Usage
### Loading the library
```js
// load the main API class
import Kmb from "js-kmb-api";
// load the type definitions
import {Language, Stop, Stop, Route, Variant, StopRoute, Eta} from "js-kmb-api"
```

### Using the library
```js
// create an API instance
// It's recommended to use localStorage to cache stops, and sessionStorage to cache stop routes
// because stop names do not change often and are reloaded automatically
const kmb = new Kmb('en', localStorage, sessionStorage);

// create an API instance without caching
const kmb_no_cache = new Kmb('zh-hans');

// Load the routes (directions) named '104'
const routes = await kmb.getRoutes('104');

// Load the main variant of the forward direction
const variants = await routes.filter(route => route.bound === 1).getVariants();
const variant = await variants.sort((a, b) => a.serviceType - b.serviceType)[0];

// Load the stop list of the main variant
const stoppings = await variant.getStoppings();

// Find a stop called "Immigration Tower"
const stopping = stoppings.find(stopping => stopping.stop.name === 'Immigration Tower');

// Get the ETA there
const etas = await stopping.getEtas(); 

````

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