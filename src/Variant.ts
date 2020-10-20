import Route from "./Route";
import Stop from "./Stop";

export default interface Variant {
    readonly route : Route;
    readonly serviceType : number;
    readonly origin : string;
    readonly destination : string;
    readonly description : string;
    getOriginDestinationString() : string;
    getStops() : Promise<Stop[]>;
}