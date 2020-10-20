export default interface Route {
    readonly number : string;
    readonly bound : number;
    getRouteBound() : string;
}