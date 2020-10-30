import {params, suite, test} from '@testdeck/mocha';
import {assert} from 'chai';
import {SinonFakeTimers} from 'sinon';
import Kmb from '../src';
import Secret from '../src/Secret';
import {TestCase} from "./TestCase";
import Sinon = require('sinon');

@suite
export class StoppingTest extends TestCase {
    clock : SinonFakeTimers | undefined;

    after() : void {
        this.clock?.restore();
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
            eta : [{
                w : string,
                ex : string,
                eot : string,
                t : string,
                ei : string,
                bus_service_type : number,
                wifi : null,
                ol : string,
                dis? : number
            }],
            expected : [[string, number | undefined, string, boolean]]
        }
    ) : Promise<void> {
        this.clock = Sinon.useFakeTimers(new Date(now));
        Sinon.stub(Secret, 'getSecret')
            .returns(new Secret('A06F1CC2A3A43BD8B7A80846F7D65501AE1503A9', 1043206738));
        const fetcher = () => Promise.resolve(eta);
        const kmb = new Kmb();
        const stop_route = new kmb.Stopping(
            new kmb.Stop('WE01-N-1250-0', 'Western Harbour Crossing')
            , new kmb.Variant(new kmb.Route('960', 2), 1, 'Wan Chai North', 'Tuen Mun (Kin Sang Estate)', '')
            , 'B'
            , 10
            , 15.2
        );
        const results = await stop_route.getEtas(5, fetcher);
        assert.deepStrictEqual(
            results
            , expected.map(
                ([date, ...args]) => new kmb.Eta(stop_route, new Date(date), ...args)
            )
        );
    }

    @test
    async getEtasWithFailures() : Promise<void> {
        const {stop_route, fetcher} = StoppingTest.setUpFailureCalls();
        const results = await stop_route.getEtas(3, fetcher);
        assert.deepStrictEqual(results, []);
    }

    @test
    async getEtasWithTooManyFailures() : Promise<void> {
        const {stop_route, fetcher} = StoppingTest.setUpFailureCalls();
        await assert.isRejected(stop_route.getEtas(2, fetcher));
    }

    private static setUpFailureCalls() {
        const fetcher = () => {
            if (fetcher.count < 3) {
                ++fetcher.count;
                return Promise.reject(new Error('something wrong happened'));
            }
            return Promise.resolve([]);
        };
        fetcher.count = 0;

        const kmb = new Kmb();
        const stop_route = new kmb.Stopping(
            new kmb.Stop('WE01-N-1250-0', 'Western Harbour Crossing')
            , new kmb.Variant(new kmb.Route('960', 2), 1, 'Wan Chai North', 'Tuen Mun (Kin Sang Estate)', '')
            , 'B'
            , 10
            , 15.2
        );
        return {stop_route, fetcher};
    }
}