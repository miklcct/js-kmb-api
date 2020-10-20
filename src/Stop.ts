import IncompleteStop from "./IncompleteStop";

export default interface Stop extends IncompleteStop {
    readonly routeDirection: string;
    readonly sequence: number;
}