import https = require('https');
import StorageShim = require('node-storage-shim');
import path = require('path');
import rootCas = require('ssl-root-cas');
import 'array-flat-polyfill';
import Axios from "axios";
import hkscsConverter = require('hkscs_unicode_converter');

import {Language} from "./Language";
import Secret from './Secret';
import {StoppingCacheType} from "./StoppingCacheType";

/**
 * A stop which consists of its ID and name
 */
type Stop = InstanceType<Kmb['Stop']>;
/**
 * A route which consists of its route number (e.g. 104) and its bound (1 for forward, 2 for backward)
 */
type Route = InstanceType<Kmb['Route']>;
/**
 * A variant, identified by the route and the variant number (service type)
 */
type Variant = InstanceType<Kmb['Variant']>;
/**
 * An instance which a variant stops at a bus stop
 */
type Stopping = InstanceType<Kmb['Stopping']>;
/**
 * An ETA entry
 */
type Eta = InstanceType<Kmb['Eta']>;

/**
 * main KMB API class
 */
export default class Kmb {
    public readonly Stop;
    public readonly Route;
    public readonly Variant;
    public readonly Stopping;
    public readonly Eta;

    private readonly apiEndpoint = 'https://search.kmb.hk/KMBWebSite/Function/FunctionRequest.ashx';

    // change the below when the storage used is no longer compatible with the old version
    public static readonly STORAGE_VERSION_KEY = '$version';
    private static readonly stopStorageVersion = 3;
    private static readonly stoppingStorageVersion = 3;

    /**
     * Construct an API instance
     * @param language
     * @param stopStorage The cache used for storing stop names (suggest localStorage in browser). If not specified an in-memory store is used.
     * @param stoppingStorage The cache used for storing stoppings (suggest sessionStorage in browser)
     * @param corsProxyUrl If specified all ETA requests will go through the CORS proxy. Required to get ETAs in browser.
     *
     * @example
     * // construct an English API in Node.js
     * const api = new Kmb();
     * @example
     * // construct a simplified Chinese API in the browser
     * const api = new Kmb('zh-hans', localStorage, sessionStorage, 'https://cors-anywhere.herokuapp.com/')
     */
    public constructor(
        public readonly language : Language = 'en'
        , stopStorage : Storage = new StorageShim()
        , stoppingStorage? : Storage
        , public corsProxyUrl : string | null = null
    ) {
        for (
            const {storage, version} of
            [
                {storage : stopStorage, version : Kmb.stopStorageVersion},
                {storage : stoppingStorage, version : Kmb.stoppingStorageVersion},
            ]
        ) {
            if (storage !== undefined && Number(storage[Kmb.STORAGE_VERSION_KEY]) !== version) {
                storage.clear();
                storage[Kmb.STORAGE_VERSION_KEY] = version;
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const kmb = this;
        this.Stop = class {
            public constructor(public readonly id : string, name? : string) {
                if (stopStorage !== undefined && name !== undefined) {
                    stopStorage[`${id}_${kmb.language}`] = name;
                }
            }

            /**
             * The "street" part of the ID, e.g. "AB01"
             */
            public get streetId() : string {
                return this.id.split('-')[0];
            }

            /**
             * The "direction" part of the ID, normally N, E, S, W for directions, K, C for circular road or T for terminus
             */
            public get streetDirection() : string {
                return this.id.split('-')[1];
            }

            /**
             * The name of the stop, undefined if it isn't in the cache
             */
            public get name() : string | undefined {
                return stopStorage === undefined ? undefined : stopStorage.getItem(`${this.id}_${kmb.language}`)
                    ?? undefined;
            }

            /**
             * Get the list of route variants serving a particular stop
             * @param all_variants Specify to be true to list all variants for the same route and direction, false for only the main one
             * @param update_count An optional callback to update the progress of how many routes are remaining
             */
            public async getStoppings(
                all_variants = false,
                update_count? : (remaining : number) => void
            ) : Promise<Stopping[]> {
                const initial_name = this.name;
                const cached = stoppingStorage?.getItem(`${this.id}_${kmb.language}`) ?? null;
                const get_main_service_type = (variants : Variant[], route : Route) : number =>
                    Math.min(
                        ...variants.filter(a => a.route.getRouteBound() === route.getRouteBound())
                            .map(a => a.serviceType)
                    );
                const filter_stop_routes : (
                    value : Stopping,
                    index : number,
                    array : Stopping[]
                ) => boolean = all_variants
                    ? () => true
                    : (value, index, array) =>
                        value.variant.serviceType === get_main_service_type(
                            array.map(a => a.variant),
                            value.variant.route
                        );
                if (cached !== null) {
                    const result = JSON.parse(cached) as StoppingCacheType;
                    return result.map(
                        item => {
                            const name = new kmb.Stop(item.stop.id).name;
                            if (name === undefined) {
                                throw new Error('Attempting to load StopRoute cache but stop name can\'t be found');
                            }
                            return new kmb.Stopping(
                                new kmb.Stop(item.stop.id, name)
                                , new kmb.Variant(
                                    new kmb.Route(item.variant.route.number, item.variant.route.bound)
                                    , item.variant.serviceType
                                    , item.variant.origin
                                    , item.variant.destination
                                    , item.variant.description
                                )
                                , item.direction
                                , item.sequence
                                , item.fare
                            );
                        }
                    ).filter(filter_stop_routes);
                } else {
                    const json = await kmb.callApi(
                        {
                            action : 'getRoutesInStop',
                            bsiCode : this.id
                        }
                    ) as {data : string[]};
                    let remaining_routes = json.data.length;
                    if (update_count !== undefined) {
                        update_count(remaining_routes);
                    }
                    const results = (
                        await Promise.all(
                            json.data.map(
                                async item => {
                                    const route_number = item.trim();
                                    // loop through each route and bound
                                    // let remaining_bounds = data.length;
                                    const results = (
                                        await Promise.all(
                                            (await kmb.getRoutes(route_number)).map(
                                                async route => (
                                                    await Promise.all(
                                                        (await route.getVariants()).map(
                                                            async variant => (await variant.getStoppings()).filter(
                                                                ({stop : inner_stop}) =>
                                                                    inner_stop.id === this.id
                                                                    || initial_name !== undefined
                                                                    // some poles in the same bus terminus are missing words "Bus Terminus"
                                                                        && (inner_stop.streetDirection === 'T' || inner_stop.name === initial_name)
                                                                        && inner_stop.streetId === this.streetId
                                                                        && inner_stop.streetDirection === this.streetDirection
                                                            )
                                                        )
                                                    )
                                                ).flat()
                                            )
                                        )
                                    ).flat();
                                    --remaining_routes;
                                    if (update_count !== undefined) {
                                        update_count(remaining_routes);
                                    }
                                    return results;
                                }
                            )
                        )
                    ).flat();
                    if (initial_name === undefined) {
                        // when initial name is undefined the result may be incomplete
                        return results[0].stop.getStoppings(all_variants, update_count);
                    } else {
                        stoppingStorage?.setItem(`${this.id}_${kmb.language}`, JSON.stringify(results));
                        return results.filter(filter_stop_routes);
                    }
                }
            }
        };

        this.Route = class {
            /**
             * @param number The route number, e.g. 104
             * @param bound The bound, normally 1 for forward, 2 for backward
             */
            public constructor(public readonly number : string, public readonly bound : number) {
            }

            /**
             * @returns a string in forms of "Route-Bound" which can be used as an identifier, e.g. "58X-2"
             */
            public getRouteBound() : string {
                return `${this.number}-${this.bound}`;
            }

            /**
             * Compares the routes according to human's expectation
             *
             * The routes are sorted according to its letter prefix, the number part sorted naturally, and the letter suffix.
             * If the route numbers are the same, the bounds are compared
             *
             * @param a
             * @param b
             */
            public static compare(a : Route, b : Route) : -1 | 0 | 1 {
                const compare_route_number = (a : string, b : string) => {
                    const explode_segments = (route_id : string) => {
                        const segments : string[] = [];
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
                    const a_segments : (string | number)[] = explode_segments(a);
                    const b_segments : (string | number)[] = explode_segments(b);
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
                            } else {
                                if (b_segments[i] < a_segments[i]) {
                                    return 1;
                                }
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

            public async getVariants() : Promise<Variant[]> {
                const json = await kmb.callApi(
                    {
                        action : 'getSpecialRoute',
                        route : this.number,
                        bound : String(this.bound),
                    }
                ) as {
                    data : {
                        CountSpecial : number, routes : {
                            ServiceType : string,
                            Origin_ENG : string, Destination_ENG : string, Desc_ENG : string
                            Origin_CHI : string, Destination_CHI : string, Desc_CHI : string
                        }[], result : boolean
                    }
                };
                return json.data.routes.map(
                    item => new kmb.Variant(
                        this
                        , Number(item.ServiceType)
                        , Kmb.toTitleCase(
                            Kmb.convertHkscs(
                                item[
                                    {
                                        'en' : 'Origin_ENG',
                                        'zh-hans' : 'Origin_CHI',
                                        'zh-hant' : 'Origin_CHI'
                                    }[kmb.language] as keyof typeof json.data.routes[0]
                                ]
                            )
                        )
                        , Kmb.toTitleCase(
                            Kmb.convertHkscs(
                                item[
                                    {
                                        'en' : 'Destination_ENG',
                                        'zh-hans' : 'Destination_CHI',
                                        'zh-hant' : 'Destination_CHI'
                                    }[kmb.language] as keyof typeof json.data.routes[0]
                                ]
                            )
                        )
                        , Kmb.convertHkscs(
                            item[
                                {
                                    'en' : 'Desc_ENG',
                                    'zh-hans' : 'Desc_CHI',
                                    'zh-hant' : 'Desc_CHI'
                                }[kmb.language] as keyof typeof json.data.routes[0]
                            ]
                        )
                    )
                );
            }
        };

        this.Variant = class {
            /**
             * Create a route variant
             *
             * @param route The route which the variant belongs to
             * @param serviceType A number identifying the particular variant
             * @param origin
             * @param destination
             * @param description The description of the variant, e.g. "Normal routeing"
             */
            constructor(
                public readonly route : Route
                , public readonly serviceType : number
                , public readonly origin : string
                , public readonly destination : string
                , public readonly description : string
            ) {
            }

            /**
             * @returns a string in form of "origin → destination"
             */
            public getOriginDestinationString() : string {
                return `${this.origin} → ${this.destination}`;
            }

            public async getStoppings() : Promise<Stopping[]> {
                const json = await kmb.callApi(
                    {
                        action : 'getstops',
                        route : this.route.number,
                        bound : String(this.route.bound),
                        serviceType : String(this.serviceType)
                    }
                ) as {
                    data : {
                        routeStops : {
                            BSICode : string,
                            Direction : string,
                            Seq : string,
                            EName : string,
                            SCName : string,
                            CName : string,
                            ELocation : string,
                            SCLocation : string,
                            CLocation : string,
                            AirFare : string,
                        }[]
                    }
                };
                return json.data.routeStops.map(
                    item => new kmb.Stopping(
                        new kmb.Stop(
                            item.BSICode
                            , Kmb.toTitleCase(
                                Kmb.convertHkscs(
                                    item[
                                        {
                                            'en' : 'EName',
                                            'zh-hans' : 'SCName',
                                            'zh-hant' : 'CName'
                                        }[kmb.language] as keyof typeof item
                                    ]
                                )
                            )
                        )
                        , this
                        , item.Direction.trim()
                        , Number(item.Seq)
                        , Number(item.AirFare)
                    )
                );
            }
        };

        type EtaData = {t : string, eot : string, dis? : number};

        this.Stopping = class {
            /**
             * @param stop
             * @param variant
             * @param direction A string specifying whether the stop is in forward (F) or backward (B) direction of the route
             * @param sequence The order of the stopping in the variant
             * @param fare
             */
            public constructor(
                public readonly stop : Stop
                , public readonly variant : Variant
                , public readonly direction : string
                , public readonly sequence : number
                , public readonly fare : number
            ) {
            }

            public callMobileEtaApi(method : 'GET' | 'POST' = 'GET') : Promise<EtaData[]> {
                const secret = Secret.getSecret(`${new Date().toISOString().split('.')[0]}Z`);
                const languages = {'en' : 'en', 'zh-hans' : 'sc', 'zh-hant' : 'tc'};
                const query = {
                    lang : languages[kmb.language],
                    route : this.variant.route.number,
                    bound : String(this.variant.route.bound),
                    stop_seq : String(this.sequence),
                    service_type : String(this.variant.serviceType),
                    vendor_id : Secret.VENDOR_ID,
                    apiKey : secret.apiKey,
                    ctr : String(secret.ctr)
                };
                const encrypted_query = Secret.getSecret(`?${new URLSearchParams(query).toString()}`, secret.ctr);
                const promise = method === 'POST'
                    ? Axios.post(
                        `${kmb.corsProxyUrl ?? ''}https://etav3.kmb.hk/?action=geteta`
                        , {
                            d : encrypted_query.apiKey,
                            ctr : encrypted_query.ctr
                        }
                        , {responseType : 'json', httpsAgent : Kmb.httpsAgent}
                    )
                    : Axios.get(
                        `${kmb.corsProxyUrl ?? ''}https://etav3.kmb.hk/?action=geteta`,
                        {params : query, responseType : 'json', httpsAgent : Kmb.httpsAgent}
                    );
                return promise.then(
                    ({data : json} : {data : [{eta : EtaData[]}?]}) =>
                        (json[0]?.eta ?? [])
                );
            }

            public callWebEtaApi() : Promise<EtaData[]> {
                const current_date = new Date;
                const date_string = `${current_date.getUTCFullYear()}-${(`00${current_date.getUTCMonth() + 1}`).slice(-2)}-${(`00${current_date.getUTCDate()}`).slice(-2)} ${(`00${current_date.getUTCHours()}`).slice(-2)}:${(`00${current_date.getUTCMinutes()}`).slice(-2)}:${(`00${current_date.getUTCSeconds()}`).slice(-2)}.${(`00${current_date.getUTCMilliseconds()}`).slice(-2)}.`;
                const sep = `--31${date_string}13--`;
                const token = `E${
                    (
                        typeof btoa !== 'undefined' ? btoa : (
                            (b : string) => Buffer.from(b).toString('base64')
                        )
                    )(
                        this.variant.route.number
                        + sep
                        + String(this.variant.route.bound)
                        + sep
                        + String(this.variant.serviceType)
                        + sep
                        + this.stop.id.trim().replace(/-/gi, '')
                        + sep
                        + String(this.sequence)
                        + sep
                        + String((
                            new Date
                        ).getTime())
                    )
                }`;
                return Axios.post(
                    `${(corsProxyUrl ?? '') + kmb.apiEndpoint}?action=get_ETA&lang=${{'en' : 0, 'zh-hant' : 1, 'zh-hans' : 2}[language]}`
                    , new URLSearchParams({
                        token,
                        t : date_string,
                    }).toString()
                    , {responseType : 'json', httpsAgent : Kmb.httpsAgent, headers : {Origin : 'https://search.kmb.hk'}}
                ).then(
                    ({data : json} : {data : {data : {response : EtaData[]}}}) => json.data.response ?? []
                );
            }

            // eslint-disable-next-line @typescript-eslint/unbound-method
            async getEtas(retry_count = 5, fetcher : (this : Stopping) => Promise<EtaData[]> = this.callWebEtaApi) : Promise<Eta[]> {
                const promise = fetcher.call(this);
                return promise.then(
                    (response : EtaData[]) =>
                        response
                            .map(
                                obj => (
                                    {
                                        time : obj.t.substr(0, 5),
                                        remark : obj.t.substr(6),
                                        real_time : typeof obj.dis === 'number',
                                        distance : obj.dis,
                                    }
                                )
                            )
                            .filter(obj => /^[0-9][0-9]:[0-9][0-9]$/.test(obj.time))
                            .map(
                                obj => {
                                    const time = new Date();
                                    time.setUTCHours(
                                        (Number(obj.time.split(':')[0]) + 24 - 8) % 24
                                        , Number(obj.time.split(':')[1]), 0
                                    );
                                    if (time.getTime() - Date.now() < -60 * 60 * 1000 * 2) {
                                        // the time is less than 2 hours past - assume midnight rollover
                                        time.setDate(time.getDate() + 1);
                                    }
                                    if (time.getTime() - Date.now() > 60 * 60 * 1000 * 6) {
                                        // the time is more than 6 hours in the future - assume midnight rollover
                                        time.setDate(time.getDate() - 1);
                                    }
                                    return new kmb.Eta(this, time, obj.distance, Kmb.convertHkscs(obj.remark), obj.real_time);
                                }
                            )
                    , reason => {
                        if (retry_count > 0) {
                            return this.getEtas(retry_count - 1, fetcher);
                        } else {
                            throw reason;
                        }
                    }
                );
            }
        };

        this.Eta = class {
            /**
             * Create an ETA entry
             *
             * @param stopping The stop-route where the ETA was queried
             * @param time The ETA time
             * @param distance The distance (in metres) of the bus from the stop
             * @param remark The remark of the ETA (e.g. KMB/NWFB, Scheduled)
             * @param realTime If the ETA is real-time
             */
            public constructor(
                public readonly stopping : Stopping
                , public readonly time : Date
                , public readonly distance : number | undefined
                , public readonly remark : string
                , public readonly realTime : boolean
            ) {
            }

            /**
             * Compare two ETA entries by time
             */
            public static compare(a : Eta, b : Eta) : number {
                return a.time.getTime() - b.time.getTime();
            }

        };
    }

    /**
     * Get the routes of that route number
     *
     * @return 2 routes for bi-direction non-circular routes, 1 route for single-direction or circular routes, 0 for not found
     */
    public async getRoutes(route_number : string) : Promise<Route[]> {
        const json = await this.callApi(
            {
                action : 'getroutebound',
                route : route_number
            }
        ) as {data : {ROUTE : string, BOUND : number, SERVICE_TYPE : number}[]};
        return json.data.map(({BOUND}) => BOUND)
            .filter((value : number, index : number, array : number[]) => array.indexOf(value) === index)
            .map(bound => new this.Route(route_number, bound));
    }

    /**
     * Call the FunctionRequest.ashx API on the search.kmb.hk website
     * @param query
     */
    public async callApi(query : Record<string, string>) : Promise<unknown> {
        return (
            await Axios.get(this.apiEndpoint, {params : query, responseType : 'json'})
        ).data as unknown;
    }

    public static toTitleCase(string : string) : string {
        return string.toLowerCase().replace(
            /((^|[^a-z0-9'])+)(.)/g
            , (match, p1 : string, p2 : string, p3 : string) => p1 + p3.toUpperCase()
        );
    }

    public static convertHkscs(string : string) : string {
        try {
            return hkscsConverter.convertString(string);
        } catch (e) {
            return string;
        }
    }

    private static readonly httpsAgent = (
        () => {
            // rootCas has a caveat that it will automatically add certs into the global agent, labelled "backwards compat"
            // in the source code. I don't want this behaviour happening here
            if (https.globalAgent !== undefined) {
                const original = https.globalAgent.options.ca;
                const result = new https.Agent(
                    {
                        ca : __dirname !== undefined
                            ? rootCas.create().addFile(path.resolve(__dirname, '../cert.pem'))
                            : undefined
                    }
                );
                https.globalAgent.options.ca = original;
                return result;
            } else {
                return undefined;
            }
        }
    )();
}

export {Language, Stop, Route, Variant, Stopping, Eta};