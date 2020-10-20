import {Language} from "./Language";
import {StopRouteCacheType} from "./StopRouteCacheType";
import Secret from "./Secret";
import Axios from "axios";

type IncompleteStop = InstanceType<Kmb['IncompleteStop']>;
type Route = InstanceType<Kmb['Route']>;
type Variant = InstanceType<Kmb['Variant']>;
type Stop = InstanceType<Kmb['Stop']>;
type StopRoute = InstanceType<Kmb['StopRoute']>;
type Eta = InstanceType<Kmb['Eta']>;

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
        this.IncompleteStop = class {
            public readonly id: string;
            public constructor(id : string) {
                this.id = id;
            }

            public get streetId() : string{
                return this.id.split('-')[0];
            }

            public get streetDirection(): string {
                return this.id.split('-')[1];
            }

            public get name(): string | undefined {
                return stopStorage === undefined ? undefined : stopStorage[`${this.id}_${kmb.language}`];
            }

            /**
             * Get the list of route variants serving a particular stop
             * @param update_count Specify this to update the progress of how many routes are remaining
             */
            async getStopRoutes(update_count?: (remaining: number) => void): Promise<StopRoute[]> {
                const cached = stopRouteStorage?.getItem(`${this.id}_${kmb.language}`) ?? null;
                if (cached !== null) {
                    const result: StopRouteCacheType = JSON.parse(cached);
                    return result.map(
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
                } else {
                    const json = await kmb.callApi(
                        {
                            action: 'getRoutesInStop',
                            bsiCode: this.id
                        }
                    ) as { data: string[] };
                    const map = new Map<Route, StopRoute[]>();
                    let remaining_routes = json.data.length;
                    if (update_count !== undefined) {
                        update_count(remaining_routes);
                    }
                    await Promise.all(
                        json.data.map(
                            async item => {
                                const route_number = item.trim();
                                // loop through each route and bound
                                // let remaining_bounds = data.length;
                                await Promise.all(
                                    (await kmb.getRoutes(route_number)).map(
                                        async route =>
                                            await Promise.all(
                                                (await route.getVariants()).map(
                                                    async variant =>
                                                        (await variant.getStops()).forEach(
                                                            inner_stop => {
                                                                if (
                                                                    inner_stop.id === this.id || this instanceof kmb.Stop
                                                                    // some poles in the same bus terminus are missing words "Bus Terminus"
                                                                    && (inner_stop.streetDirection === 'T' || inner_stop.name === this.name)
                                                                    && inner_stop.streetId === this.streetId
                                                                    && inner_stop.streetDirection === this.streetDirection
                                                                ) {
                                                                    // allow duplicate entries for the same variant but disallow multiple variants
                                                                    const existing = map.get(variant.route);
                                                                    const array =
                                                                        existing === undefined
                                                                        || variant.serviceType < existing[0].variant.serviceType
                                                                        ? (() => {
                                                                            const empty : StopRoute[] = [];
                                                                            map.set(variant.route, empty);
                                                                            return empty;
                                                                        })()
                                                                        : existing;
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
                    const results = Array.from(map.values()).flat();
                    if (!(this instanceof kmb.Stop)) {
                        return results[0].stop.getStopRoutes(update_count);
                    } else {
                        stopRouteStorage?.setItem(`${this.id}_${kmb.language}`, JSON.stringify(results));
                        return results;
                    }
                }
            }
        };

        this.Route = class {
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
            public getRouteBound(): string {
                return `${this.number}-${this.bound}`;
            }

            /**
             * Get the list of variants from a route
             */
            public async getVariants(): Promise<Variant[]> {
                const json = await kmb.callApi(
                    {
                        action: 'getSpecialRoute',
                        route: this.number,
                        bound: String(this.bound),
                    }
                ) as {
                    data: {
                        CountSpecial: number, routes: {
                            ServiceType: string,
                            Origin_ENG: string, Destination_ENG: string, Desc_ENG: string
                            Origin_CHI: string, Destination_CHI: string, Desc_CHI: string
                        }[], result: boolean
                    }
                };
                return json.data.routes.map(
                    item => new kmb.Variant(
                        this
                        , Number(item.ServiceType)
                        , Kmb.toTitleCase(
                            item[
                                {
                                    'en': 'Origin_ENG',
                                    'zh-hans': 'Origin_CHI',
                                    'zh-hant': 'Origin_CHI'
                                }[kmb.language] as keyof typeof json.data.routes[0]
                                ]
                        )
                        , Kmb.toTitleCase(
                            item[
                                {
                                    'en': 'Destination_ENG',
                                    'zh-hans': 'Destination_CHI',
                                    'zh-hant': 'Destination_CHI'
                                }[kmb.language] as keyof typeof json.data.routes[0]
                                ]
                        )
                        , item[
                            {
                                'en': 'Desc_ENG',
                                'zh-hans': 'Desc_CHI',
                                'zh-hant': 'Desc_CHI'
                            }[kmb.language] as keyof typeof json.data.routes[0]
                            ]
                    )
                );
            }

            public static compare(a: Route, b: Route): -1 | 0 | 1 {
                const compare_route_number = (a: string, b: string) => {
                    const explode_segments = (route_id: string) => {
                        const segments: string[] = [];
                        [...route_id].forEach(
                            character => {
                                function is_number(x: string) {
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
        };

        this.Variant = class {
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

            public async getStops() : Promise<Stop[]> {
                const json = await kmb.callApi(
                    {
                        action: 'getstops',
                        route: this.route.number,
                        bound: String(this.route.bound),
                        serviceType: String(this.serviceType)
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
        };

        this.StopRoute = class {
            public readonly stop;
            public readonly variant;
            public readonly sequence : number;
            public constructor(stop : Stop, variant: Variant, sequence: number) {
                this.stop = stop;
                this.variant = variant;
                this.sequence = sequence;
            }

            async getEtas(retry_count = 5) : Promise<Eta[]> {
                const secret = Secret.getSecret(`${new Date().toISOString().split('.')[0]}Z`);
                const languages = {'en': 'en', 'zh-hans': 'sc', 'zh-hant': 'tc'};
                const query = {
                    lang: languages[kmb.language],
                    route: this.variant.route.number,
                    bound: String(this.variant.route.bound),
                    stop_seq: String(this.sequence),
                    service_type: String(this.variant.serviceType),
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
                                    return new kmb.Eta(this, time, obj.distance, obj.remark, obj.real_time);
                                }
                            )
                    , reason => {
                        if (retry_count > 0) {
                            return this.getEtas(retry_count - 1);
                        } else {
                            throw reason;
                        }
                    }
                );
            }
        };

        this.Eta = class {
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

        };
    }

    public async getRoutes(route_number: string): Promise<Route[]> {
        const json = await this.callApi(
            {
                action: 'getroutebound',
                route: route_number
            }
        ) as { data: { ROUTE: string, BOUND: number, SERVICE_TYPE: number }[] };
        return json.data.map(({BOUND}) => BOUND)
            .filter((value: number, index: number, array: number[]) => array.indexOf(value) === index)
            .map(bound => new this.Route(route_number, bound));
    }

    public async callApi(query: Record<string, string>): Promise<Record<string, unknown>> {
        return (await Axios.get(this.apiEndpoint, {params: query, responseType: 'json'})).data;
    }

    public static toTitleCase(string: string): string {
        return string.toLowerCase().replace(/((^|[^a-z0-9'])+)(.)/g, (match, p1, p2, p3) => p1 + p3.toUpperCase());
    }
}

export {Language, IncompleteStop, Stop, Route, Variant, StopRoute, Eta};