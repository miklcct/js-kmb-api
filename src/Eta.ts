import StopRoute from "./StopRoute";

export default interface Eta {
    readonly stopRoute : StopRoute;
    readonly time : Date;
    readonly distance? : number;
    readonly remark : string;
    readonly realTime : boolean;
}