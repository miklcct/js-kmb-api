import StopRoute from "./StopRoute";

export default interface IncompleteStop {
    readonly id : string;
    readonly name? : string;
    readonly streetId : string;
    readonly streetDirection : string;
    getStopRoutes(update_count? : (remaining : number) => void) : Promise<StopRoute[]>
}