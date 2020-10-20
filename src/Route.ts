import Variant from "./Variant";

export default interface Route {
    readonly number : string;
    readonly bound : number;
    getRouteBound() : string;
    getVariants() : Promise<Variant[]>
}