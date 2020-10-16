import {TestCase} from "./TestCase";
import {params, suite, test} from '@testdeck/mocha';
import {assert} from 'chai';
import Variant from "../src/Variant";
import Route from "../src/Route";
import Sinon from "sinon";
import Common from "../src/Common";
import {Language} from "../src/Language";

@suite
export class VariantTest extends TestCase {
    @test
    getOriginDestinationString(): void {
        assert.strictEqual(
            '大埔(富亨) → 大埔中心(循環線)'
            , new Variant(
                new Route('71B', 1)
                , 1
                , '大埔(富亨)'
                , '大埔中心(循環線)'
                , ''
            ).getOriginDestinationString()
        );
    }

    @params(['en', 'ENG'], 'get English variant list')
    @params(['zh-hant', 'CHI'], 'get traditional Chinese variant list')
    @params(['zh-hans', 'CHI'], 'get simplified Chinese variant list')
    @test
    async getVariantList([language, column_suffix] : [Language, 'CHI' | 'ENG']): Promise<void> {
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
        const api_stub = Sinon.stub(Common, 'callApi').withArgs({action : 'getSpecialRoute', route : '104', bound : '2'})
            .returns(
                Promise.resolve(
                    json
                )
            );
        Sinon.stub(Common, 'getLanguage').returns(language);
        const route = new Route('104', 2);
        const variants = await Variant.get(route);
        assert(api_stub.calledOnce);
        assert.deepStrictEqual(
            variants
            , json.data.routes.map(
                item => new Variant(
                    route
                    , Number(item.ServiceType)
                    , item[`Origin_${column_suffix}` as keyof typeof item].toTitleCase()
                    , item[`Destination_${column_suffix}` as keyof typeof item].toTitleCase()
                    , item[`Desc_${column_suffix}` as keyof typeof item]
                )
            )
        );
    }
}