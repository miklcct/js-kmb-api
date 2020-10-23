//const Kmb = require('js-kmb-api').default;
const Kmb = require('./dist/src').default;

const kmb = new Kmb;

async function example() {
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
}

void example();