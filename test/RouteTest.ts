import {params, suite, test} from '@testdeck/mocha';
import {assert} from 'chai';
import Kmb, {Language} from "../src";
import {TestCase} from "./TestCase";
import Sinon = require("sinon");

@suite
export class RouteTest extends TestCase {
    @test
    getRouteBound(): void {
        assert.strictEqual(new (new Kmb).Route('N260', 2).getRouteBound(), 'N260-2');
    }

    @params(
        [new (new Kmb).Route('58M', 1), new (new Kmb).Route('58M', 1), 0]
        , 'compare same route'
    )
    @params(
        [new (new Kmb).Route('58M', 1), new (new Kmb).Route('58M', 0), 1]
        , 'compare same route with decreasing bounds'
    )
    @params(
        [new (new Kmb).Route('58M', 1), new (new Kmb).Route('58M', 2), -1]
        , 'compare same route with increasing bounds'
    )
    @params(
        [new (new Kmb).Route('44', 2), new (new Kmb).Route('44P', 2), -1]
        , 'compare routes without and with suffix'
    )
    @params(
        [new (new Kmb).Route('44P', 1), new (new Kmb).Route('44', 1), 1]
        , 'compare routes with and without suffix'
    )
    @params(
        [new (new Kmb).Route('58M', 2), new (new Kmb).Route('58X', 1), -1]
        , 'compare routes with increasing suffix'
    )
    @params(
        [new (new Kmb).Route('58X', 1), new (new Kmb).Route('58M', 2), 1]
        , 'compare routes with decreasing suffix'
    )
    @params(
        [new (new Kmb).Route('99R', 2), new (new Kmb).Route('101', 1), -1]
        , 'compare routes with increasing number'
    )
    @params(
        [new (new Kmb).Route('101', 1), new (new Kmb).Route('99R', 2), 1]
        , 'compare routes with decreasing number'
    )
    @params(
        [new (new Kmb).Route('99R', 2), new (new Kmb).Route('101', 1), -1]
        , 'compare routes with increasing number'
    )
    @params(
        [new (new Kmb).Route('985', 2), new (new Kmb).Route('A33X', 1), -1]
        , 'compare routes beginning with a number and a letter'
    )
    @params(
        [new (new Kmb).Route('A33X', 2), new (new Kmb).Route('985', 1), 1]
        , 'compare routes beginning with a letter and a number'
    )
    compare([a, b, result] : [InstanceType<Kmb["Route"]>, InstanceType<Kmb["Route"]>, -1 | 0 | 1]) : void {
        assert.strictEqual((new Kmb).Route.compare(a, b), result);
    }

    @params(['en', 'ENG'], 'get English variant list')
    @params(['zh-hant', 'CHI'], 'get traditional Chinese variant list')
    @params(['zh-hans', 'CHI'], 'get simplified Chinese variant list')
    @test
    async getVariants([language, column_suffix] : [Language, 'CHI' | 'ENG']): Promise<void> {
        const json = {
            "data": {
                "routes": [
                    {
                        "Destination_ENG": "KENNEDY TOWN",
                        "Origin_ENG": "SHAM SHUI PO (PAK TIN ESTATE)",
                        "Origin_CHI": "深水(白田)",
                        "To_saturday": "2350",
                        "From_saturday": "0545",
                        "Desc_CHI": "",
                        "Desc_ENG": "",
                        "ServiceType": "01   ",
                        "Route": "104",
                        "Destination_CHI": "堅尼地城",
                        "Bound": "2",
                        "From_weekday": "0545",
                        "From_holiday": "0545",
                        "To_weekday": "2350",
                        "To_holiday": "2350"
                    },
                    {
                        "Destination_ENG": "QUEEN VICTORIA STREET",
                        "Origin_ENG": "CROSS HARBOUR TUNNEL",
                        "Origin_CHI": "紅磡海底隧道",
                        "To_saturday": "0000",
                        "From_saturday": "0000",
                        "Desc_CHI": "星期一至五 早上繁忙時間特別服務",
                        "Desc_ENG": "Morning Peak Special Departures Monday to Friday",
                        "ServiceType": "02   ",
                        "Route": "104",
                        "Destination_CHI": "域多利皇后街",
                        "Bound": "2",
                        "From_weekday": "0000",
                        "From_holiday": "0000",
                        "To_weekday": "0000",
                        "To_holiday": "0000"
                    },
                    {
                        "Destination_ENG": "QUEEN VICTORIA STREET",
                        "Origin_ENG": "CHAK ON",
                        "Origin_CHI": "澤安",
                        "To_saturday": "0000",
                        "From_saturday": "0000",
                        "Desc_CHI": "星期一至六 早上繁忙時間特別服務",
                        "Desc_ENG": "Morning Peak Special Departures Monday to Saturday",
                        "ServiceType": "05   ",
                        "Route": "104",
                        "Destination_CHI": "域多利皇后街",
                        "Bound": "2",
                        "From_weekday": "0000",
                        "From_holiday": "0000",
                        "To_weekday": "0000",
                        "To_holiday": "0000"
                    },
                    {
                        "Destination_ENG": "KENNEDY TOWN",
                        "Origin_ENG": "CROSS HARBOUR TUNNEL",
                        "Origin_CHI": "紅磡海底隧道",
                        "To_saturday": "0000",
                        "From_saturday": "0000",
                        "Desc_CHI": "星期一至六 早上繁忙時間特別服務",
                        "Desc_ENG": "Morning Peak Special Departures Monday to Saturday",
                        "ServiceType": "07   ",
                        "Route": "104",
                        "Destination_CHI": "堅尼地城",
                        "Bound": "2",
                        "From_weekday": "0000",
                        "From_holiday": "0000",
                        "To_weekday": "0000",
                        "To_holiday": "0000"
                    }
                ], "CountSpecal": 3
            }, "result": true
        };
        const kmb = new Kmb(language);
        const api_stub = Sinon.stub(kmb, 'callApi').returns(Promise.resolve(json));
        const route = new kmb.Route('104', 2);
        const variants = await route.getVariants();
        assert(api_stub.calledWithExactly({action : 'getSpecialRoute', route : '104', bound : '2'}));
        assert.deepStrictEqual(
            variants
            , json.data.routes.map(
                item => new kmb.Variant(
                    route
                    , Number(item.ServiceType)
                    , Kmb.toTitleCase(Kmb.convertHkscs(item[`Origin_${column_suffix}` as keyof typeof item]))
                    , Kmb.toTitleCase(Kmb.convertHkscs(item[`Destination_${column_suffix}` as keyof typeof item]))
                    , Kmb.convertHkscs(item[`Desc_${column_suffix}` as keyof typeof item])
                )
            )
        );
    }
}