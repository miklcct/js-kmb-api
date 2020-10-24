import {params, suite, test} from '@testdeck/mocha';
import {assert} from 'chai';
import Sinon = require('sinon');
import Storage = require('node-storage-shim');
import Kmb from "../src";
import {TestCase} from "./TestCase";

@suite
export class StopTest extends TestCase {
    @test
    storageIsSetWhenConstructedWithName(): void {
        const storage = new Storage;
        // noinspection ObjectAllocationIgnored
        new (new Kmb('en', storage)).Stop('EX01-C-1000-0', 'Example');
        assert.strictEqual(storage.getItem('EX01-C-1000-0_en'), 'Example');
    }

    @test
    storageIsSetWhenConstructedWithoutName(): void {
        const storage = new Storage;
        // noinspection ObjectAllocationIgnored
        new (new Kmb('en', storage)).Stop('EX01-C-1000-0');
        assert.isNull(storage.getItem('EX01-C-1000-0_en'));
    }

    @test
    getStreetId() : void {
        assert.strictEqual(new (new Kmb).Stop('CA07-S-2800-0').streetId, 'CA07');
    }

    @test
    getStreetDirection() : void {
        assert.strictEqual(new (new Kmb).Stop('CA07-S-2800-0').streetDirection, 'S');
    }

    @test
    getNameWithoutStorage() : void {
        assert.isUndefined(new new Kmb().Stop('TS06-S-1000-0').name);
    }

    @test
    getNameWithEmptyStorage(): void {
        assert.isUndefined(new new Kmb('en', new Storage).Stop('TS06-S-1000-0').name);
    }

    @test
    getNameFromStorage(): void {
        const storage = new Storage;
        // initialise the storage to the appropriate version
        void new Kmb(undefined, storage);
        storage.setItem('TS06-S-1000-0_zh-hans', '青雲站');
        assert.strictEqual(new new Kmb('zh-hans', storage).Stop('TS06-S-1000-0').name, '青雲站');
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
            input: {id: 'YY88-Y-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
            ],
            all_variants: false,
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
            input: {id: 'YY88-Y-8888-8'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
            ],
            all_variants: false,
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
            input: {id: 'YY88-Y-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
            ],
            all_variants: false,
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
            input: {id: 'YY88-T-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-T-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-T-8899-8', 'Another stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 1
                    , 0.0
                ),
            ],
            all_variants: false,
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
            input: {id: 'YY88-Y-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 1
                    , 0.0
                ),
            ],
            all_variants: false,
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
            input: {id: 'YY88-Y-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8899-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 1
                    , 0.0
                ),
            ],
            all_variants: false,
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
            input: {id: 'YY88-Y-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
            ],
            all_variants: false,
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
            input: {id: 'YY88-Y-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
            ],
            all_variants: false,
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
            input: {id: 'YY88-Y-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 2, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
            ],
            all_variants: false,
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
            input: {id: 'YY88-Y-8899-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 2, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
            ],
            all_variants: false,
        }
        , 'two variants at different poles'
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
            input: {id: 'YY88-Y-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 2, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 3, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
            ],
            all_variants: true,
        }
        , 'two variants at same pole showing all variants'
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
            input: {id: 'YY88-Y-8899-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 2, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8899-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 3, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
            ],
            all_variants: true,
        }
        , 'two variants at different poles showing all variants'
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
            input: {id: 'YY88-Y-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8899-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 2), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
            ],
            all_variants: false,
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
            input: {id: 'YY88-Y-8888-8', name: 'This stop'},
            expected: [
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8888-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                ),
                new (new Kmb).Stopping(
                    new (new Kmb).Stop('YY88-Y-8899-8', 'This stop')
                    , new (new Kmb).Variant(new (new Kmb).Route('1B', 2), 3, '', '', '')
                    , 'F'
                    , 5
                    , 0.0
                ),
            ],
            all_variants: false,
        }
        , 'two routes'
    )
    @test
    async getStoppings(
        {data, input, expected, all_variants}: {
            data: Record<string, Record<number, Record<number, Record<number, { id: string, name: string }>>>>,
            input: { id: string, name?: string },
            expected: InstanceType<Kmb["Stopping"]>[],
            all_variants: boolean,
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
                                            Sinon.stub(variant, 'getStoppings')
                                                .returns(
                                                    Promise.resolve(
                                                        Object.entries(variant_details).map(
                                                            ([key, value]) => new kmb.Stopping(
                                                                new kmb.Stop(value.id, value.name)
                                                                , variant
                                                                , 'F'
                                                                , Number(key)
                                                                , 0.0
                                                            )
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
        api_stub.calledWithExactly({action: 'getRoutesInStop', 'bsiCode': input.id});
        const real_input = input.name === undefined ? new kmb.Stop(input.id) : new kmb.Stop(input.id, input.name);
        assert.deepStrictEqual(await real_input.getStoppings(all_variants), expected);
        assert.deepStrictEqual(
            JSON.parse(storage.getItem(`${input.id}_${kmb.language}`) ?? '')
            , await real_input.getStoppings(true)
        );
    }

    @test
    async getStopRoutesFromStorage(): Promise<void> {
        const stop_storage = new Storage;
        const storage = new Storage;
        const kmb = new Kmb('en', stop_storage, storage);
        const cache = [
            new kmb.Stopping(
                new kmb.Stop('YY88-Y-8888-8', 'This stop')
                , new kmb.Variant(new kmb.Route('1A', 1), 1, '', '', '')
                , 'F'
                , 0
                , 0.0
            ),
            new kmb.Stopping(
                new kmb.Stop('YY88-Y-8888-8', 'This stop')
                , new kmb.Variant(new kmb.Route('1A', 1), 2, '', '', '')
                , 'F'
                , 0
                , 0.0
            ),
        ];
        storage.setItem(
            `YY88-Y-8888-8_${kmb.language}`
            , JSON.stringify(cache)
        );
        const spy = Sinon.spy(kmb, 'callApi');
        const result_all_variants = await new kmb.Stop('YY88-Y-8888-8').getStoppings(true);
        const result_single_variant = await new kmb.Stop('YY88-Y-8888-8').getStoppings(false);
        assert.deepStrictEqual(result_all_variants, cache);
        assert.deepStrictEqual(
            result_single_variant
            , [
                new kmb.Stopping(
                    new kmb.Stop('YY88-Y-8888-8', 'This stop')
                    , new kmb.Variant(new kmb.Route('1A', 1), 1, '', '', '')
                    , 'F'
                    , 0
                    , 0.0
                )
            ]
        );
        assert.deepStrictEqual(JSON.parse(storage.getItem(`YY88-Y-8888-8_${kmb.language}`) ?? ''), cache);
        assert(spy.notCalled);
    }
}