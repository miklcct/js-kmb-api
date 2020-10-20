import Route from "./Route";

export default interface Variant {
    readonly route : Route;
    readonly serviceType : number;
    readonly origin : string;
    readonly destination : string;
    readonly description : string;
    getOriginDestinationString() : string;
}