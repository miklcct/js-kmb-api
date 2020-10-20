import Stop from "./Stop";
import Variant from "./Variant";
import Eta from "./Eta";

export default interface StopRoute {
    readonly stop : Stop;
    readonly variant : Variant;
    readonly sequence : number;
    getEtas() : Promise<Eta[]>;
}