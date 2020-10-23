# Node.js module for getting bus information of KMB
This is a node.js module for getting bus service information of KMB routes. It can get routes, stops, variants, and ETAs.  

[Try it out in RunKit](https://runkit.com/miklcct/5f93015edf489c001abca071)

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
