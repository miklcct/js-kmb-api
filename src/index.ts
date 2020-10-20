import {Language} from "./Language";
import {StopRouteCacheType} from "./StopRouteCacheType";
import Secret from "./Secret";
import IncompleteStop from "./IncompleteStop";
import Route from "./Route";
import Variant from "./Variant";
import Stop from "./Stop";
import StopRoute from "./StopRoute";
import Eta from "./Eta";
import Axios from "axios";

export default class Kmb {
    public proxyUrl = 'https://miklcct.com/proxy/';
    public apiEndpoint = 'https://search.kmb.hk/KMBWebSite/Function/FunctionRequest.ashx';

    public readonly language : Language;
    public readonly IncompleteStop;
    public readonly Stop;
    public readonly Route;
    public readonly Variant;
    public readonly StopRoute;
    public readonly Eta;

    public constructor(language : Language = 'en', stopStorage? : Storage, stopRouteStorage? : Storage) {
        if (stopRouteStorage !== undefined && stopStorage === undefined) {
            throw new Error('Cannot use stopRouteStorage without stopStorage');
        }
        this.language = language;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const kmb = this;
        this.IncompleteStop = class implements IncompleteStop {
            public readonly id: string;
            public constructor(id : string) {
                this.id = id;
            }

            public get streetId() : string{
                return this.id.split('-')[0];
            }

            public get streetDirection() : string {
                return this.id.split('-')[1];
            }

            public get name() : string | undefined {
                return stopStorage === undefined ? undefined : stopStorage[`${this.id}_${kmb.language}`];
            }
        };

        this.Route = class implements Route {
            public readonly number : string;
            public readonly bound : number;
            public constructor(number : string, bound : number) {
                this.number = number;
                this.bound = bound;
            }

            /**
             * Get a string in the format "Route-Bound"
             * @returns {string}
             */
            public getRouteBound() : string {
                return `${this.number}-${this.bound}`;
            }

            public static compare(a : Route, b : Route) : -1 | 0 | 1 {
                const compare_route_number = (a : string, b : string) => {
                    const explode_segments = (route_id : string) => {
                        const segments: string[] = [];
                        [...route_id].forEach(
                            character => {
                                function is_number(x : string) {
                                    return x >= '0' && x <= '9';
                                }
                                if (
                                    segments.length === 0
                                    || is_number(
                                    segments[segments.length - 1]
                                        .charAt(segments[segments.length - 1].length - 1)
                                    ) !== is_number(character)
                                ) {
                                    segments.push(character);
                                } else {
                                    segments[segments.length - 1] += character;
                                }
                            }
                        );
                        return segments;
                    };
                    const a_segments : (string|number)[] = explode_segments(a);
                    const b_segments : (string|number)[] = explode_segments(b);
                    let i = 0;
                    while (i < a_segments.length && i < b_segments.length) {
                        const is_a_number = !isNaN(Number(a_segments[i]));
                        const is_b_number = !isNaN(Number(b_segments[i]));
                        if (is_a_number === is_b_number) {
                            if (is_a_number) {
                                a_segments[i] = Number(a_segments[i]);
                                b_segments[i] = Number(b_segments[i]);
                            }
                            if (a_segments[i] < b_segments[i]) {
                                return -1;
                            } else if (b_segments[i] < a_segments[i]) {
                                return 1;
                            }
                        } else {
                            return is_a_number > is_b_number ? -1 : 1;
                        }
                        ++i;
                    }
                    return i >= a_segments.length ? i >= b_segments.length ? 0 : -1 : 1;
                };

                return a.number === b.number
                    ? a.bound > b.bound ? 1 : a.bound < b.bound ? -1 : 0
                    : compare_route_number(a.number, b.number);
            }

            public static async getBounds(route : string) : Promise<number[]>{
                const json = await kmb.callApi(
                    {
                        action : 'getroutebound',
                        route
                    }
                ) as {data : { ROUTE: string, BOUND: number, SERVICE_TYPE: number }[]};
                return json.data.map(
                    ({BOUND}) => BOUND
                ).filter((value : number, index : number, array : number[]) => array.indexOf(value) === index);
            }
        };

        this.Variant = class implements Variant {
            public readonly route;
            public readonly serviceType;
            public readonly origin;
            public readonly destination;
            public readonly description;

            /**
             * Create a route variant
             *
             * @param route The route which the variant belongs to
             * @param serviceType A number identifying the particular variant
             * @param origin
             * @param destination
             * @param description The description of the variant, e.g. "Normal routeing"
             */
            constructor(route : Route, serviceType : number, origin : string, destination : string, description : string) {
                this.route = route;
                this.serviceType = serviceType;
                this.origin = origin;
                this.destination = destination;
                this.description = description;
            }

            public getOriginDestinationString() : string {
                return `${this.origin} → ${this.destination}`;
            }

            /**
             * Get the list of variants from a route
             */
            static async get(route : Route) : Promise<Variant[]>{
                const json = await kmb.callApi(
                    {
                        action : 'getSpecialRoute',
                        route : route.number,
                        bound : String(route.bound),
                    }
                ) as {
                    data: {
                        CountSpecial : number
                        , routes: {
                            ServiceType : string,
                            Origin_ENG : string, Destination_ENG : string, Desc_ENG : string
                            Origin_CHI : string, Destination_CHI : string, Desc_CHI : string
                        }[]
                        , result : boolean
                    }
                };
                return json.data.routes.map(
                    item => new kmb.Variant(
                        route
                        , Number(item.ServiceType)
                        , Kmb.toTitleCase(
                            item[
                                {
                                    'en' : 'Origin_ENG',
                                    'zh-hans' : 'Origin_CHI',
                                    'zh-hant' : 'Origin_CHI'
                                }[kmb.language] as keyof typeof json.data.routes[0]
                            ]
                        )
                        , Kmb.toTitleCase(
                            item[
                                {
                                    'en' : 'Destination_ENG',
                                    'zh-hans' : 'Destination_CHI',
                                    'zh-hant' : 'Destination_CHI'
                                }[kmb.language] as keyof typeof json.data.routes[0]
                            ]
                        )
                        , item[
                            {
                                'en' : 'Desc_ENG',
                                'zh-hans' : 'Desc_CHI',
                                'zh-hant' : 'Desc_CHI'
                            }[kmb.language] as keyof typeof json.data.routes[0]
                        ]
                    )
                );
            }
        };

        this.Stop = class extends this.IncompleteStop {
            public readonly routeDirection: string;
            public readonly sequence: number;

            constructor(id: string, name: string, routeDirection: string, sequence: number) {
                super(id);
                if (stopStorage !== undefined) {
                    stopStorage[`${id}_${kmb.language}`] = name;
                }
                this.routeDirection = routeDirection;
                this.sequence = sequence;
            }

            public static async get(variant: Variant) : Promise<Stop[]> {
                const json = await kmb.callApi(
                    {
                        action: 'getstops',
                        route: variant.route.number,
                        bound: String(variant.route.bound),
                        serviceType: String(variant.serviceType)
                    }
                ) as {
                    data: {
                        routeStops: { BSICode: string, Direction: string, Seq: string, EName: string, SCName: string, CName: string }[]
                    }
                };
                return json.data.routeStops.map(
                    item => new kmb.Stop(
                        item.BSICode
                        , Kmb.toTitleCase(
                            item[
                                {
                                    'en': 'EName',
                                    'zh-hans': 'SCName',
                                    'zh-hant': 'CName'
                                }[kmb.language] as keyof typeof item
                            ]
                        )
                        , item.Direction.trim()
                        , Number(item.Seq)
                    )
                );
            }
        };

        this.StopRoute = class implements StopRoute {
            public readonly stop;
            public readonly variant;
            public readonly sequence : number;
            public constructor(stop : Stop, variant: Variant, sequence: number) {
                this.stop = stop;
                this.variant = variant;
                this.sequence = sequence;
            }

            /**
             * Get the list of route variants serving a particular stop
             * @param stop
             * @param update_count Specify this to update the progress of how many routes are remaining
             */
            static async get(stop : IncompleteStop, update_count? : (remaining: number) => void) : Promise<Record<string, StopRoute[]>>{
                const cached = stopRouteStorage?.getItem(`${stop.id}_${kmb.language}`) ?? null;
                if (cached !== null) {
                    const result = JSON.parse(cached);
                    (Object.entries(result) as [string, StopRouteCacheType][]).forEach(
                        ([key, value]) => {
                            result[key] = value.map(
                                item => {
                                    const name = new kmb.IncompleteStop(item.stop.id).name;
                                    if (name === undefined) {
                                        throw new Error('Attempting to load StopRoute cache but stop name can\'t be found');
                                    }
                                    return new kmb.StopRoute(
                                        new kmb.Stop(item.stop.id, name, item.stop.routeDirection, item.stop.sequence)
                                        , new kmb.Variant(
                                            new kmb.Route(item.variant.route.number, item.variant.route.bound)
                                            , item.variant.serviceType
                                            , item.variant.origin
                                            , item.variant.destination
                                            , item.variant.description
                                        )
                                        , item.sequence
                                    );
                                }
                            );
                        }
                    );
                    return result;
                } else {
                    const json = await kmb.callApi(
                        {
                            action : 'getRoutesInStop',
                            bsiCode : stop.id
                        }
                    ) as {data : string[]};
                    const results : Record<string, StopRoute[]> = {};
                    let remaining_routes = json.data.length;
                    if (update_count !== undefined) {
                        update_count(remaining_routes);
                    }
                    await Promise.all(
                        json.data.map(
                            async item => {
                                const route = item.trim();
                                // loop through each route and bound
                                // let remaining_bounds = data.length;
                                await Promise.all(
                                    (await kmb.Route.getBounds(route)).map(
                                        async bound =>
                                            await Promise.all(
                                                (await kmb.Variant.get(new kmb.Route(route, bound))).map(
                                                    async variant =>
                                                        (await kmb.Stop.get(variant)).forEach(
                                                            inner_stop => {
                                                                if (
                                                                    inner_stop.id === stop.id || stop instanceof kmb.Stop
                                                                    // some poles in the same bus terminus are missing words "Bus Terminus"
                                                                    && (inner_stop.streetDirection === 'T' || inner_stop.name === stop.name)
                                                                    && inner_stop.streetId === stop.streetId
                                                                    && inner_stop.streetDirection === stop.streetDirection
                                                                ) {
                                                                    // allow duplicate entries for the same variant but disallow multiple variants
                                                                    if (
                                                                        !Object.prototype.hasOwnProperty.call(results, variant.route.getRouteBound())
                                                                        || variant.serviceType < results[variant.route.getRouteBound()][0].variant.serviceType
                                                                    ) {
                                                                        results[variant.route.getRouteBound()] = [];
                                                                    }
                                                                    const array = results[variant.route.getRouteBound()];
                                                                    if (array.length === 0 || variant.serviceType === array[0].variant.serviceType) {
                                                                        array.push(new kmb.StopRoute(inner_stop, variant, inner_stop.sequence));
                                                                    }
                                                                }
                                                            }
                                                        )
                                                )
                                            )
                                    )
                                );
                                --remaining_routes;
                                if (update_count !== undefined) {
                                    update_count(remaining_routes);
                                }
                            }
                        )
                    );
                    if (!(stop instanceof kmb.Stop)) {
                        return kmb.StopRoute.get(Object.values(results)[0][0].stop, update_count);
                    } else {
                        stopRouteStorage?.setItem(`${stop.id}_${kmb.language}`, JSON.stringify(results));
                        return results;
                    }
                }
            }
        };

        this.Eta = class implements Eta {
            public static maxRetryCount = 5;
            public static mobileApiMethod : 'GET' | 'POST' = 'GET';

            public readonly stopRoute;
            public readonly time: Date;
            public readonly distance?: number;
            public readonly remark: string;
            public readonly realTime: boolean;

            /**
             * Create an ETA entry
             *
             * @param stopRoute The stop-route where the ETA was queried
             * @param time The ETA time
             * @param distance The distance (in metres) of the bus from the stop
             * @param remark The remark of the ETA (e.g. KMB/NWFB, Scheduled)
             * @param realTime If the ETA is real-time
             */
            public constructor(stopRoute : StopRoute, time : Date, distance : number | undefined, remark : string, realTime : boolean) {
                this.stopRoute = stopRoute;
                this.time = time;
                this.distance = distance;
                this.remark = remark;
                this.realTime = realTime;
            }

            /**
             * Compare two ETA entries by time
             */
            public static compare(a : Eta, b : Eta) : number {
                return a.time.getTime() - b.time.getTime();
            }

            /**
             * Get a list of ETAs by a route at stop
             */
            static async get(stopRoute : StopRoute, retry_count = 0) : Promise<Eta[]> {
                const secret = Secret.getSecret(`${new Date().toISOString().split('.')[0]}Z`);
                const languages = {'en': 'en', 'zh-hans': 'sc', 'zh-hant': 'tc'};
                const query = {
                    lang: languages[kmb.language],
                    route: stopRoute.variant.route.number,
                    bound: String(stopRoute.variant.route.bound),
                    stop_seq: String(stopRoute.sequence),
                    service_type: String(stopRoute.variant.serviceType),
                    vendor_id: Secret.VENDOR_ID,
                    apiKey: secret.apiKey,
                    ctr: String(secret.ctr)
                };
                const encrypted_query = Secret.getSecret(`?${new URLSearchParams(query).toString()}`, secret.ctr);
                return (
                    kmb.Eta.mobileApiMethod === 'POST'
                        ? Axios.post(
                            `${kmb.proxyUrl}https://etav3.kmb.hk/?action=geteta`
                            ,{
                                d: encrypted_query.apiKey,
                                ctr: encrypted_query.ctr
                            }
                            , {responseType : 'json'}
                        )
                        : Axios.get(`${kmb.proxyUrl}https://etav3.kmb.hk/?action=geteta`, {params : query, responseType : 'json'})
                ).then(
                    ({data : json} : {data : [{ eta: {t : string, eot : string, dis? : number}[]}?]}) =>
                        (json[0]?.eta ?? [])
                            .map(
                                obj => (
                                    {
                                        time: obj.t.substr(0, 5),
                                        remark: obj.t.substr(5),
                                        real_time: typeof obj.dis === 'number',
                                        distance: obj.dis,
                                    }
                                )
                            )
                            .filter(
                                obj =>
                                    obj.time.match(/^[0-9][0-9]:[0-9][0-9]$/) !== null)
                            .map(
                                obj => {
                                    const time = new Date();
                                    time.setHours(Number(obj.time.split(':')[0]), Number(obj.time.split(':')[1]), 0);
                                    if (time.getTime() - Date.now() < -60 * 60 * 1000 * 2) {
                                        // the time is less than 2 hours past - assume midnight rollover
                                        time.setDate(time.getDate() + 1);
                                    }
                                    if (time.getTime() - Date.now() > 60 * 60 * 1000 * 6) {
                                        // the time is more than 6 hours in the future - assume midnight rollover
                                        time.setDate(time.getDate() - 1);
                                    }
                                    return new kmb.Eta(stopRoute, time, obj.distance, obj.remark, obj.real_time);
                                }
                            )
                    , reason => {
                        if (retry_count + 1 < kmb.Eta.maxRetryCount) {
                            return kmb.Eta.get(stopRoute, retry_count + 1);
                        } else {
                            throw reason;
                        }
                    }
                );
            }
        };
    }

    public async callApi(query : Record<string, string>) : Promise<Record<string, unknown>> {
        return Axios.get(this.apiEndpoint, {params : query, responseType : 'json'});
    }

    public static toTitleCase(string : string) : string {
        return string.toLowerCase().replace(/((^|[^a-z0-9'])+)(.)/g,  (match, p1, p2, p3) => p1 + p3.toUpperCase());
    }

    /**
     * Get the stop ID in the query string
     *
     * @todo: remove this and move to front-end
     */
    public static getQueryStopId() : string | null {
        return (new URLSearchParams(window.location.search)).get('stop');
    }

    /**
     * Get the selected route IDs and stop positions in the query string
     *
     * @todo: remove this and move to front-end
     */
    public static getQuerySelections() : [string, number|null][]{
        return (new URLSearchParams(window.location.search)).getAll('selections').map(
            item => {
                const segments = item.split(':');
                return [segments[0], segments.length >= 2 ? Number(segments[1]) : null];
            }
        );
    }

    /**
     * Get if "one departure" mode is selected
     *
     * @todo: remove this and move to front-end
     */
    public static getQueryOneDeparture() : boolean {
        return Boolean((new URLSearchParams(window.location.search)).get('one_departure'));
    }
}

export {Language, IncompleteStop, Stop, Route, Variant, StopRoute, Eta};