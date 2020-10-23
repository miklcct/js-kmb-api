import {params, suite, test} from '@testdeck/mocha';
import {assert} from 'chai';
import nock from 'nock';
import Sinon, {SinonFakeTimers} from 'sinon';
import Kmb, {Language, StopRoute} from '../src';
import Secret from '../src/Secret';
import {TestCase} from "./TestCase";

@suite
export class StopRouteTest extends TestCase {
    clock : SinonFakeTimers | undefined;

    static before() : void {
        if (!nock.isActive()) {
            nock.activate();
        }
    }

    static after() : void {
        nock.restore();
    }

    after() : void {
        this.clock?.restore();
        nock.cleanAll();
        super.after();
    }

    @params(
        {
            now : '2020-10-18T14:21:57+08:00',
            eta : [],
            expected : []
        }
        , 'no ETA'
    )
    @params(
        {
            now : '2020-10-18T14:21:57+08:00',
            eta : [
                {
                    w : 'Y',
                    ex : '2020-10-18 14:11:43',
                    eot : 'E',
                    t : '14:10',
                    ei : 'Y',
                    bus_service_type : 1,
                    wifi : null,
                    ol : 'N',
                    dis : 2953
                },
                {
                    w : 'Y',
                    ex : '2020-10-18 14:23:22',
                    eot : 'E',
                    t : '14:22',
                    ei : 'Y',
                    bus_service_type : 1,
                    wifi : null,
                    ol : 'N',
                },
                {
                    w : 'Y',
                    ex : '2020-10-18 14:34:13',
                    eot : 'E',
                    t : '14:33 Last Bus',
                    ei : 'Y',
                    bus_service_type : 1,
                    wifi : null,
                    ol : 'N',
                    dis : 7274
                }
            ],
            expected : [
                ['2020-10-18T14:10:00+08:00', 2953, '', true],
                ['2020-10-18T14:22:00+08:00', undefined, '', false],
                ['2020-10-18T14:33:00+08:00', 7274, 'Last Bus', true],
            ]
        }
        , 'simple case'
    )
    @params(
        {
            now : '2020-10-18T14:21:57+08:00',
            eta : [
                {
                    w : "N",
                    ex : "2020-10-22 16:45:16",
                    eot : "T",
                    t : "No scheduled departure at this moment",
                    ei : null,
                    bus_service_type : 1,
                    wifi : null,
                    ol : "N",
                    dis : null
                }
            ],
            expected : []
        }
        , 'ETA is not available'
    )
    @params(
        {
            now : '2020-10-18T23:59:21+08:00',
            eta : [
                {
                    w : 'Y',
                    ex : '2020-10-19 00:00:05',
                    eot : 'E',
                    t : '23:57',
                    ei : 'Y',
                    bus_service_type : 1,
                    wifi : null,
                    ol : 'N',
                    dis : 2953
                },
                {
                    w : 'Y',
                    ex : '2020-10-19 00:00:05',
                    eot : 'E',
                    t : '00:03',
                    ei : 'Y',
                    bus_service_type : 1,
                    wifi : null,
                    ol : 'N',
                },
                {
                    w : 'Y',
                    ex : '2020-10-19 00:00:05',
                    eot : 'E',
                    t : '00:10 Last Bus',
                    ei : 'Y',
                    bus_service_type : 1,
                    wifi : null,
                    ol : 'N',
                    dis : 7274
                }
            ],
            expected : [
                ['2020-10-18T23:57:00+08:00', 2953, '', true],
                ['2020-10-19T00:03:00+08:00', undefined, '', false],
                ['2020-10-19T00:10:00+08:00', 7274, 'Last Bus', true],
            ]
        }
        , 'before midnight'
    )
    @params(
        {
            now : '2020-10-19T00:02:13+08:00',
            eta : [
                {
                    w : 'Y',
                    ex : '2020-10-19 00:03:05',
                    eot : 'E',
                    t : '23:57',
                    ei : 'Y',
                    bus_service_type : 1,
                    wifi : null,
                    ol : 'N',
                    dis : 2953
                },
                {
                    w : 'Y',
                    ex : '2020-10-19 00:03:05',
                    eot : 'E',
                    t : '00:03',
                    ei : 'Y',
                    bus_service_type : 1,
                    wifi : null,
                    ol : 'N',
                },
                {
                    w : 'Y',
                    ex : '2020-10-19 00:03:05',
                    eot : 'E',
                    t : '00:10 Last Bus',
                    ei : 'Y',
                    bus_service_type : 1,
                    wifi : null,
                    ol : 'N',
                    dis : 7274
                }
            ],
            expected : [
                ['2020-10-18T23:57:00+08:00', 2953, '', true],
                ['2020-10-19T00:03:00+08:00', undefined, '', false],
                ['2020-10-19T00:10:00+08:00', 7274, 'Last Bus', true],
            ]
        }
        , 'after midnight'
    )
    @test
    async getEtasWithGet(
        {now, eta, expected} : {
            now : string,
            eta : {
                w : string,
                ex : string,
                eot : string,
                t : string,
                ei : string,
                bus_service_type : number,
                wifi : null,
                ol : string,
                dis? : number
            },
            expected : [[string, number | undefined, string, boolean]]
        }
    ) : Promise<void> {
        this.clock = Sinon.useFakeTimers(new Date(now));
        Sinon.stub(Secret, 'getSecret')
            .returns(new Secret('A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9', 1043206738));
        nock('https://etav3.kmb.hk').get('/').query(
            {
                action : 'geteta',
                lang : 'en',
                route : '960',
                bound : '2',
                stop_seq : '10',
                service_type : '1',
                vendor_id : Secret.VENDOR_ID,
                apiKey : 'A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9',
                ctr : '1043206738',
            }
        ).reply(
            200
            , [
                {
                    routeNo : '960',
                    bound : 2,
                    service_type : 1,
                    seq : 10,
                    responsecode : 0,
                    updated : 1603346890000,
                    generated : 1603346896767,
                    eta
                }
            ]
        );
        const kmb = new Kmb();
        const stop_route = new kmb.StopRoute(
            new kmb.Stop('WE01-N-1250-0', 'Western Harbour Crossing', 'B', 10)
            , new kmb.Variant(new kmb.Route('960', 2), 1, 'Wan Chai North', 'Tuen Mun (Kin Sang Estate)', '')
            , 10
        );
        const results = await stop_route.getEtas(5, 'GET');
        assert.deepStrictEqual(
            results
            , expected.map(
                ([date, ...args]) => new kmb.Eta(stop_route, new Date(date), ...args)
            )
        );
    }

    @test
    async getEtasWithFailures() : Promise<void> {
        const stop_route = StopRouteTest.setUpFailureCalls();
        const results = await stop_route.getEtas(3, 'GET');
        assert.deepStrictEqual(results, []);
    }

    @test
    async getEtasWithTooManyFailures() : Promise<void> {
        const stop_route = StopRouteTest.setUpFailureCalls();
        await assert.isRejected(stop_route.getEtas(2, 'GET'));
    }

    @test
    async getEtasWithProxy() : Promise<void> {
        Sinon.stub(Secret, 'getSecret')
            .returns(new Secret('A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9', 1043206738));
        const proxy_url = 'https://example.com/';
        nock(proxy_url)?.get(`/https://etav3.kmb.hk/`).query(
            {
                action : 'geteta',
                lang : 'en',
                route : '960',
                bound : '2',
                stop_seq : '10',
                service_type : '1',
                vendor_id : Secret.VENDOR_ID,
                apiKey : 'A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9',
                ctr : '1043206738',
            }
        ).reply(
            200
            , [
                {
                    routeNo : '960',
                    bound : 2,
                    service_type : 1,
                    seq : 10,
                    responsecode : 0,
                    updated : 1603346890000,
                    generated : 1603346896767,
                    eta : []
                }
            ]
        );
        const kmb = new Kmb(undefined, undefined, undefined, proxy_url);
        const stop_route = new kmb.StopRoute(
            new kmb.Stop('WE01-N-1250-0', 'Western Harbour Crossing', 'B', 10)
            , new kmb.Variant(new kmb.Route('960', 2), 1, 'Wan Chai North', 'Tuen Mun (Kin Sang Estate)', '')
            , 10
        );
        await stop_route.getEtas();
    }

    @params(['en', 'en'], 'English')
    @params(['zh-hans', 'sc'], 'Simplified Chinese')
    @params(['zh-hant', 'tc'], 'Traditional Chinese')
    @test
    async getEtasInDifferentLanguages([language, api_language] : [Language, string]) : Promise<void> {
        Sinon.stub(Secret, 'getSecret')
            .returns(new Secret('A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9', 1043206738));
        nock('https://etav3.kmb.hk').get('/').query(
            {
                action : 'geteta',
                lang : api_language,
                route : '960',
                bound : '2',
                stop_seq : '10',
                service_type : '1',
                vendor_id : Secret.VENDOR_ID,
                apiKey : 'A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9',
                ctr : '1043206738',
            }
        )
            .reply(
                200
                , [
                    {
                        routeNo : '960',
                        bound : 2,
                        service_type : 1,
                        seq : 10,
                        responsecode : 0,
                        updated : 1603346890000,
                        generated : 1603346896767,
                        eta : []
                    }
                ]
            );
        const kmb = new Kmb(language, undefined, undefined);
        const stop_route = new kmb.StopRoute(
            new kmb.Stop('WE01-N-1250-0', 'Western Harbour Crossing', 'B', 10)
            , new kmb.Variant(new kmb.Route('960', 2), 1, 'Wan Chai North', 'Tuen Mun (Kin Sang Estate)', '')
            , 10
        );
        await stop_route.getEtas();
    }

    @test
    async getEtasWithPost() : Promise<void> {
        this.clock = Sinon.useFakeTimers(new Date('2020-10-18T14:21:57+08:00'));
        const secret_stub = Sinon.stub(Secret, 'getSecret');
        secret_stub.returns(new Secret('A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9', 1043206738));
        const data = new Secret('8551C38904BF72BEF85A43EBF8F40D02BDBBD800', 1043206738);
        secret_stub.withArgs(
            `?${
                new URLSearchParams(
                    {
                        lang : 'en',
                        route : '960',
                        bound : '2',
                        stop_seq : '10',
                        service_type : '1',
                        vendor_id : Secret.VENDOR_ID,
                        apiKey : 'A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9',
                        ctr : '1043206738',
                    }
                )
                    .toString()
            }`
        )
            .returns(data);
        const eta_server = nock('https://etav3.kmb.hk/');
        eta_server.post('/?action=geteta', {d : data.apiKey, ctr : data.ctr}).reply(500, {});
        eta_server.post('/?action=geteta', {d : data.apiKey, ctr : data.ctr}).reply(
            200
            , [
                {
                    routeNo : '960',
                    bound : 2,
                    service_type : 1,
                    seq : 10,
                    responsecode : 0,
                    updated : 1603346890000,
                    generated : 1603346896767,
                    eta : []
                }
            ]
        );
        const kmb = new Kmb();
        const stop_route = new kmb.StopRoute(
            new kmb.Stop('WE01-N-1250-0', 'Western Harbour Crossing', 'B', 10)
            , new kmb.Variant(new kmb.Route('960', 2), 1, 'Wan Chai North', 'Tuen Mun (Kin Sang Estate)', '')
            , 10
        );
        await stop_route.getEtas(5, 'POST');
    }

    private static setUpFailureCalls() : StopRoute {
        Sinon.stub(Secret, 'getSecret')
            .returns(new Secret('A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9', 1043206738));
        const eta_server = nock('https://etav3.kmb.hk');
        eta_server.get('/').query(
            {
                action : 'geteta',
                lang : 'en',
                route : '960',
                bound : '2',
                stop_seq : '10',
                service_type : '1',
                vendor_id : Secret.VENDOR_ID,
                apiKey : 'A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9',
                ctr : '1043206738',
            }
        ).times(3).reply(500, {'error' : 'Something wrong happened'});
        eta_server.get('/').query(
            {
                action : 'geteta',
                lang : 'en',
                route : '960',
                bound : '2',
                stop_seq : '10',
                service_type : '1',
                vendor_id : Secret.VENDOR_ID,
                apiKey : 'A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9',
                ctr : '1043206738',
            }
        ).reply(
            200
            , [
                {
                    routeNo : '960',
                    bound : 2,
                    service_type : 1,
                    seq : 10,
                    responsecode : 0,
                    updated : 1603346890000,
                    generated : 1603346896767,
                    eta : []
                }
            ]
        );
        const kmb = new Kmb();
        const stop_route = new kmb.StopRoute(
            new kmb.Stop('WE01-N-1250-0', 'Western Harbour Crossing', 'B', 10)
            , new kmb.Variant(new kmb.Route('960', 2), 1, 'Wan Chai North', 'Tuen Mun (Kin Sang Estate)', '')
            , 10
        );
        return stop_route;
    }
}