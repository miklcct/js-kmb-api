# Javascript module for getting KMB data
This is a library for getting KMB data. It can get routes, stops, variants, and ETAs.

## Example Usage
### Loading the library
```typescript
// load the main API class
import Kmb from "js-kmb-api";
// load the type definitions
import {Language, Stop, IncompleteStop, Route, Variant, StopRoute, Eta} from "js-kmb-api"
```

### Using the library
```js
// create an API instance
// It's recommended to use localStorage to cache stops, and sessionStorage to cache stop routes
// because stop names do not change often and are reloaded automatically
const kmb = new Kmb('en', localStorage, sessionStorage);

// create an API instance without caching
const kmb_no_cache = new Kmb('zh-hans');
````

## Classes
All the classes below are inside the kmb object tying them to the API instance

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