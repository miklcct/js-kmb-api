import {TestCase} from "./TestCase";
import {params, suite, test} from '@testdeck/mocha';
import {assert} from 'chai';
import Sinon from "sinon";
import Kmb from "../src";

@suite
export class VariantTest extends TestCase {
    @test
    getOriginDestinationString(): void {
        const kmb = new Kmb;
        assert.strictEqual(
            '大埔(富亨) → 大埔中心(循環線)'
            , new kmb.Variant(
                new kmb.Route('71B', 1)
                , 1
                , '大埔(富亨)'
                , '大埔中心(循環線)'
                , ''
            ).getOriginDestinationString()
        );
    }

    @params(
        {
            data: {
                '1A': {
                    1: {
                        1: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8888-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 0
                ),
            ],
        }
        , 'simple case'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        1: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8888-8'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 0
                ),
            ],
        }
        , 'simple case with incomplete stop'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        1: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                            1: {id: 'YY88-Y-8899-8', name: 'Another stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8888-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 0
                ),
            ],
        }
        , 'different stops on same street'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        1: {
                            0: {id: 'YY88-T-8888-8', name: 'This stop'},
                            1: {id: 'YY88-T-8899-8', name: 'Another stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-T-8888-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-T-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 0
                ),
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-T-8899-8', 'Another stop', 'F', 1)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 1
                ),
            ],
        }
        , 'different stop names on same terminus'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        1: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                            1: {id: 'YY88-Y-8888-8', name: 'This stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8888-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 0
                ),
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 1)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 1
                ),
            ],
        }
        , 'stopping twice at same poles'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        1: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                            1: {id: 'YY88-Y-8899-8', name: 'This stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8888-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 0
                ),
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8899-8', 'This stop', 'F', 1)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 1
                ),
            ],
        }
        , 'stopping twice at different poles'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        1: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                            1: {id: 'YY88-X-8888-8', name: 'This stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8888-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 0
                ),
            ],
        }
        , 'different street direction'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        1: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                            1: {id: 'YY89-Y-8888-8', name: 'This stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8888-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 0
                ),
            ],
        }
        , 'different street'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        2: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                        },
                        3: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8888-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 2, '', '', '')
                    , 0
                ),
            ],
        }
        , 'two variants at same pole'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        2: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                        },
                        3: {
                            0: {id: 'YY88-Y-8899-8', name: 'This stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8899-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 2, '', '', '')
                    , 0
                ),
            ],
        }
        , 'two variants at different poles'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        1: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                        },
                    },
                    2: {
                        1: {
                            0: {id: 'YY88-Y-8899-8', name: 'This stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8888-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 0
                ),
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8899-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 2), 1, '', '', '')
                    , 0
                ),
            ],
        }
        , 'opposite direction'
    )
    @params(
        {
            data: {
                '1A': {
                    1: {
                        1: {
                            0: {id: 'YY88-Y-8888-8', name: 'This stop'},
                        },
                    },
                },
                '1B': {
                    2: {
                        3: {
                            5: {id: 'YY88-Y-8899-8', name: 'This stop'},
                        },
                    },
                },
            },
            input: {id : 'YY88-Y-8888-8', name : 'This stop'},
            expected: [
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 0
                ),
                new (new Kmb).StopRoute(
                    new (new Kmb).Stop('YY88-Y-8899-8', 'This stop', 'F', 5)
                    , new (new Kmb).Variant(new (new Kmb).Route('1B', 2), 3, '', '', '')
                    , 5
                ),
            ],
        }
        , 'two routes'
    )
    @test
    async getStopRoutes(
        {data, input, expected}: {
            data: Record<string, Record<number, Record<number, Record<number, { id: string, name: string }>>>>,
            input: {id : string, name? : string},
            expected: InstanceType<Kmb["StopRoute"]>[]
        }
    )
        : Promise<void> {
        const stop_storage = new Storage;
        const storage = new Storage;
        const kmb = new Kmb('en', stop_storage, storage);
        const api_stub = Sinon.stub(kmb, 'callApi');
        api_stub.returns(Promise.resolve({"data": Object.keys(data)}));
        const getRoutes_stub = Sinon.stub(kmb, 'getRoutes');
        for (const [route_number, route_details] of Object.entries(data)) {
            getRoutes_stub.withArgs(route_number).returns(
                Promise.resolve(
                    Object.entries(route_details).map(
                        ([direction, direction_details]) => {
                            const route = new kmb.Route(route_number, Number(direction));
                            Sinon.stub(route, 'getVariants').returns(
                                Promise.resolve(
                                    Object.entries(direction_details).map(
                                        ([variant_id, variant_details]) => {
                                            const variant = new kmb.Variant(route, Number(variant_id), '', '', '');
                                            Sinon.stub(variant, 'getStops')
                                                .returns(
                                                    Promise.resolve(
                                                        Object.entries(variant_details).map(
                                                            ([key, value]) => new kmb.Stop(value.id, value.name, 'F', Number(key))
                                                        )
                                                    )
                                                );
                                            return variant;
                                        }
                                    )
                                )
                            );
                            return route;
                        }
                    )
                )
            );
        }
        api_stub.calledWithExactly(({action: 'getRoutesInStop', 'bsiCode': input.id}));
        const real_input = input.name === undefined ? new kmb.IncompleteStop(input.id) : new kmb.Stop(input.id, input.name, 'F', 0);
        assert.deepStrictEqual(await real_input.getStopRoutes(), expected);
        assert.deepStrictEqual(
            JSON.parse(storage.getItem(`${input.id}_${kmb.language}`) ?? '')
            , JSON.parse(JSON.stringify(expected))
        );
    }

    @test
    async getStopRoutesFromStorage(): Promise<void> {
        const stop_storage = new Storage;
        const storage = new Storage;
        const kmb = new Kmb('en', stop_storage, storage);
        const expected = [
            new kmb.StopRoute(
                new kmb.Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                , new kmb.Variant(new kmb.Route('1A', 1), 1, '', '', '')
                , 0
            ),
        ];
        storage.setItem(
            `YY88-Y-8888-8_${kmb.language}`
            , JSON.stringify(expected)
        );
        const spy = Sinon.spy(kmb, 'callApi');
        const result = await new kmb.IncompleteStop('YY88-Y-8888-8').getStopRoutes();
        assert(spy.notCalled);
        assert.deepStrictEqual(result, expected);
    }
}