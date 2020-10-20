import Stop from "./Stop";
import Variant from "./Variant";

export default interface StopRoute {
    readonly stop : Stop;
    readonly variant : Variant;
    readonly sequence : number;
}