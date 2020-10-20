import {suite, test, params} from '@testdeck/mocha';
import {assert} from 'chai';
import {TestCase} from "./TestCase";
import Sinon from "sinon";
import Kmb from "../src";
import StopRoute from "../src/StopRoute";
import Stop from "../src/Stop";

@suite
export class StopRouteTest extends TestCase {
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
            input: new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                ],
            }
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
            input: new (new Kmb).IncompleteStop('YY88-Y-8888-8'),
            expected: {
                '1A-1' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                ],
            }
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
            input: new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                ],
            }
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
            input: new (new Kmb).Stop('YY88-T-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
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
            input: new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
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
            input: new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
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
            input: new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                ],
            }
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
            input: new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                ],
            }
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
            input: new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 2, '', '', '')
                        , 0
                    ),
                ],
            }
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
            input: new (new Kmb).Stop('YY88-Y-8899-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 2, '', '', '')
                        , 0
                    ),
                ],
            }
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
            input: new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                ],
                '1A-2' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8899-8', 'This stop', 'F', 0)
                        , new (new Kmb).Variant(new (new Kmb).Route('1A', 2), 1, '', '', '')
                        , 0
                    ),
                ],
            }
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
            input: new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                ],
                '1B-2' : [
                    new (new Kmb).StopRoute(
                        new (new Kmb).Stop('YY88-Y-8899-8', 'This stop', 'F', 5)
                        , new (new Kmb).Variant(new (new Kmb).Route('1B', 2), 3, '', '', '')
                        , 5
                    ),
                ],
            }
        }
        , 'two routes'
    )
    @test
    async getStopRouteList(
        {data, input, expected} : {
            data : Record<string, Record<number, Record<number, Record<number, {id : string, name : string}>>>>,
            input : Stop,
            expected : Record<string, StopRoute[]>
        }
    )
        : Promise<void>
    {
        const stop_storage = new Storage;
        const storage = new Storage;
        const kmb = new Kmb('en', stop_storage, storage);
        const api_stub = Sinon.stub(kmb, 'callApi');
        api_stub.withArgs({action : 'getRoutesInStop', 'bsiCode' : input.id})
            .returns(
                Promise.resolve({"data" : Object.keys(data)})
            );
        const route_stub = Sinon.stub(kmb.Route, 'getBounds');
        const variant_stub = Sinon.stub(kmb.Variant, 'get');
        const stop_stub = Sinon.stub(kmb.Stop, 'get');
        for (const [route_number, route_details] of Object.entries(data)) {
            route_stub.withArgs(route_number).returns(Promise.resolve(Object.keys(route_details).map(Number)));
            for (const [direction, direction_details] of Object.entries(route_details)) {
                const route = new kmb.Route(route_number, Number(direction));
                variant_stub.withArgs(route).returns(
                    Promise.resolve(
                        Object.keys(direction_details).map(variant_id => new kmb.Variant(route, Number(variant_id), '', '', ''))
                    )
                );
                for (const [variant_id, variant_details] of Object.entries(direction_details)) {
                    stop_stub.withArgs(new kmb.Variant(route, Number(variant_id), '', '', ''))
                        .returns(
                            Promise.resolve(
                                Object.entries(variant_details).map(
                                    ([key, value]) => new kmb.Stop(value.id, value.name, 'F', Number(key))
                                )
                            )
                        );
                }
            }
        }
        assert.deepStrictEqual(await kmb.StopRoute.get(input), expected);
        assert.deepStrictEqual(
            JSON.parse(storage.getItem(`${input.id}_${kmb.language}`) ?? '')
            , JSON.parse(JSON.stringify(expected))
        );
    }

    @test
    async getStopRouteListFromCache(): Promise<void> {
        const stop_storage = new Storage;
        const storage = new Storage;
        const kmb = new Kmb('en', stop_storage, storage);
        const expected = {
            '1A-1': [
                new kmb.StopRoute(
                    new kmb.Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                    , new kmb.Variant(new kmb.Route('1A', 1), 1, '', '', '')
                    , 0
                ),
            ],
        };
        storage.setItem(
            `YY88-Y-8888-8_${kmb.language}`
            , JSON.stringify(expected)
        );
        const spy = Sinon.spy(kmb, 'callApi');
        const result = await kmb.StopRoute.get(new kmb.IncompleteStop('YY88-Y-8888-8'));
        assert(spy.notCalled);
        assert.deepStrictEqual(result, expected);
    }
}