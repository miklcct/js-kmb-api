import {suite, test, params} from '@testdeck/mocha';
import {assert} from 'chai';
import {TestCase} from "./TestCase";
import Sinon from "sinon";
import Common from "../src/Common";
import Route from "../src/Route";
import Variant from "../src/Variant";
import Stop from "../src/Stop";
import StopRoute from "../src/StopRoute";

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
            input: new Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
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
                            1: {id: 'YY88-Y-8899-8', name: 'Another stop'},
                        },
                    },
                },
            },
            input: new Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
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
            input: new Stop('YY88-T-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-T-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                    new StopRoute(
                        new Stop('YY88-T-8899-8', 'Another stop', 'F', 1)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
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
            input: new Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 1)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
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
            input: new Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                    new StopRoute(
                        new Stop('YY88-Y-8899-8', 'This stop', 'F', 1)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
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
            input: new Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
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
            input: new Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
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
            input: new Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 2, '', '', '')
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
            input: new Stop('YY88-Y-8899-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 2, '', '', '')
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
            input: new Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                ],
                '1A-2' : [
                    new StopRoute(
                        new Stop('YY88-Y-8899-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 2), 1, '', '', '')
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
            input: new Stop('YY88-Y-8888-8', 'This stop', 'F', 0),
            expected: {
                '1A-1' : [
                    new StopRoute(
                        new Stop('YY88-Y-8888-8', 'This stop', 'F', 0)
                        , new Variant(new Route('1A', 1), 1, '', '', '')
                        , 0
                    ),
                ],
                '1B-2' : [
                    new StopRoute(
                        new Stop('YY88-Y-8899-8', 'This stop', 'F', 5)
                        , new Variant(new Route('1B', 2), 3, '', '', '')
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
        const api_stub = Sinon.stub(Common, 'callApi');
        api_stub.withArgs({action : 'getRoutesInStop', 'bsiCode' : input.id})
            .returns(
                Promise.resolve({"data" : Object.keys(data)})
            );
        const route_stub = Sinon.stub(Route, 'getBounds');
        const variant_stub = Sinon.stub(Variant, 'get');
        const stop_stub = Sinon.stub(Stop, 'get');
        for (const [route_number, route_details] of Object.entries(data)) {
            route_stub.withArgs(route_number).returns(Promise.resolve(Object.keys(route_details).map(Number)));
            for (const [direction, direction_details] of Object.entries(route_details)) {
                const route = new Route(route_number, Number(direction));
                variant_stub.withArgs(route).returns(
                    Promise.resolve(
                        Object.keys(direction_details).map(variant_id => new Variant(route, Number(variant_id), '', '', ''))
                    )
                );
                for (const [variant_id, variant_details] of Object.entries(direction_details)) {
                    stop_stub.withArgs(new Variant(route, Number(variant_id), '', '', ''))
                        .returns(
                            Promise.resolve(
                                Object.entries(variant_details).map(
                                    ([key, value]) => new Stop(value.id, value.name, 'F', Number(key))
                                )
                            )
                        );
                }
            }
        }
        assert.deepStrictEqual(await StopRoute.get(input), expected);
        assert.deepStrictEqual(
            JSON.parse(sessionStorage.getItem(`${input.id}_${Common.getLanguage()}`) ?? '')
            , JSON.parse(JSON.stringify(expected))
        );
    }
}