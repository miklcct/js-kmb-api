# Javascript module for getting KMB data
This is a library for getting KMB data. It can get routes, stops, variants, and ETAs.

## Classes
### `Route`
Represents a route with number and bound.
### `Stop`
Represents a stop with ID, name, direction in route and sequence in route.
The name is stored in localStorage automatically.

Calling `Stop.get` with a variant will return the stop list of that variant.

### `IncompleteStop`
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

## Node.js
This library is designed for use on the browser. Usage on node.js requires [global-jsdom](https://www.npmjs.com/package/global-jsdom) to be loaded.