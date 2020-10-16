import {suite, test, params} from '@testdeck/mocha';
import {assert} from 'chai';
import Stop from "../src/Stop";
import Sinon from "sinon";
import Common from "../src/Common";
import Variant from "../src/Variant";
import Route from "../src/Route";
import {TestCase} from "./TestCase";
import {Language} from '../src/Language';

@suite
export class StopTest extends TestCase {
    @test
    localStorageIsSetWhenConstructed(): void {
        localStorage.clear();
        Sinon.stub(Common, 'getLanguage').returns('en');
        // noinspection ObjectAllocationIgnored
        new Stop('EX01-C-1000-0', 'Example', 'I', 15);
        assert(localStorage.getItem('EX01-C-1000-0_en') === 'Example');
    }

    @params(['en', 'EName'], 'get English stop list')
    @params(['zh-hant', 'CName'], 'get traditional Chinese stop list')
    @params(['zh-hans', 'SCName'], 'get simplified Chinese stop list')
    @test
    async getStopList([language, column]: [Language, string]): Promise<void> {
        const json = {
            "data": {
                "basicInfo": {
                    "Racecourse": "N",
                    "DestEName": "TAI PO CENTRAL (CIRCULAR)",
                    "OriCName": "大埔(富亨)",
                    "ServiceTypeENG": "",
                    "DestCName": "大埔中心(循環線)",
                    "BusType": null,
                    "Airport": "N",
                    "ServiceTypeTC": "",
                    "Overnight": "N",
                    "ServiceTypeSC": "",
                    "OriSCName": "大埔(富亨)",
                    "DestSCName": "大埔中心(循环线)",
                    "Special": "N",
                    "OriEName": "TAI PO (FU HENG)"
                },
                "routeStops": [
                    {
                        "CName": "富亨總站",
                        "Y": "835427.37500000",
                        "ELocation": "FU HENG B/T",
                        "X": "835743.75000000",
                        "AirFare": "2.00000000",
                        "EName": "FU HENG BUS TERMINUS",
                        "SCName": "富亨总站",
                        "ServiceType": "1",
                        "CLocation": "富亨總站",
                        "BSICode": "FU01-T-1000-0",
                        "Seq": "0",
                        "SCLocation": "富亨总站",
                        "Direction": "F         ",
                        "Bound": "1",
                        "Route": "71B"
                    },
                    {
                        "CName": "頌雅路",
                        "Y": "835276.68750000",
                        "ELocation": "CHUNG NGA RDOPP. FU HENG ESTATENEAR L/P EA7472",
                        "X": "835808.31250000",
                        "AirFare": "2.00000000",
                        "EName": "CHUNG NGA ROAD",
                        "SCName": "颂雅路",
                        "ServiceType": "1",
                        "CLocation": "頌雅路富亨對面燈柱EA7472",
                        "BSICode": "CH23-E-1350-0",
                        "Seq": "1",
                        "SCLocation": "颂雅路富亨对面灯柱EA7472",
                        "Direction": "F         ",
                        "Bound": "1",
                        "Route": "71B"
                    },
                    {
                        "CName": "大埔中心總站",
                        "Y": "834885.50000000",
                        "ELocation": "TAI PO CENTRALTAI PO PLAZA",
                        "X": "835476.18750000",
                        "AirFare": "2.00000000",
                        "EName": "TAI PO CENTRAL BUS TERMINUS",
                        "SCName": "大埔中心总站",
                        "ServiceType": "1",
                        "CLocation": "大埔中心大埔商場",
                        "BSICode": "TA07-T-1100-0",
                        "Seq": "2",
                        "SCLocation": "大埔中心大埔商场",
                        "Direction": "B         ",
                        "Bound": "1",
                        "Route": "71B"
                    },
                    {
                        "CName": "富亨總站",
                        "Y": "835427.37500000",
                        "ELocation": "FU HENG B/T",
                        "X": "835743.75000000",
                        "AirFare": "0.00000000",
                        "EName": "FU HENG BUS TERMINUS",
                        "SCName": "富亨总站",
                        "ServiceType": "1",
                        "CLocation": "富亨總站",
                        "BSICode": "FU01-T-1000-0",
                        "Seq": "999",
                        "SCLocation": "富亨总站",
                        "Direction": "B         ",
                        "Bound": "1",
                        "Route": "71B"
                    }
                ],
                "additionalInfo": {"ENG": "", "TC": "", "SC": ""},
                "route": {
                    "lineGeometry": "{paths:[[[835755.3192,835459.820599999],[835756.211,835467.1119],[835756.3184,835473.4235],[835756.112,835475.974099999],[835756.6057,835479.4619],[835757.9505,835481.765799999],[835760.0316,835482.6833],[835766.5066,835482.615499999],[835779.8873,835482.395400001],[835792.1295,835481.1752],[835808.7716,835478.6699],[835811.4829,835476.8543],[835813.1798,835474.058700001],[835813.5471,835470.8967],[835807.301,835441.912599999],[835796.4,835359.044299999],[835794.1295,835307.7688],[835792.8472,835288.721100001],[835792.0569,835278.0703]],[[835792.0569,835278.0703],[835790.7848,835260.924799999],[835788.9287,835227.3671],[835786.7674,835192.269099999],[835786.0497,835183.2971],[835780.1759,835142.1077],[835778.9467,835119.512499999],[835777.8083,835074.552100001],[835778.3198,835051.9671],[835779.5572,835034.023],[835783.6737,834999.365],[835785.4041,834983.775900001],[835785.1768,834980.743000001],[835783.4675,834977.880000001],[835781.1178,834976.003],[835769.468,834969.908299999],[835731.5863,834962.376599999],[835724.4833,834962.046399999],[835678.8882,834960.276000001],[835650.0643,834960.2761],[835620.9352,834960.505999999],[835589.3395,834960.726199999],[835576.7838,834960.726199999],[835569.681,834960.726199999],[835564.0217,834959.505799999],[835558.5605,834956.8552],[835554.345,834951.8642],[835552.7413,834916.9201],[835543.4333,834892.679199999],[835532.6683,834884.6238],[835516.9933,834880.4087],[835476.1811,834880.9343]],[[835476.1811,834880.9343],[835431.7612,834881.467],[835428.0567,834879.564099999],[835425.8829,834876.460899999],[835425.6376,834869.610099999],[835425.146,834836.41],[835425.3905,834830.6132],[835427.0742,834826.338500001],[835430.7479,834825.8113],[835435.1565,834826.0746],[835495.1829,834826.864499999],[835500.7954,834827.9157],[835504.7448,834830.0821],[835508.4188,834835.088199999],[835508.6334,834839.772399999],[835509.1541,834844.3105],[835510.3495,834873.236],[835510.8396,834878.2424],[835512.3093,834881.6677],[835516.2281,834884.829399999],[835520.1469,834887.2006],[835527.4946,834890.0987],[835534.1077,834894.841399999],[835539.7412,834902.7459],[835542.6806,834910.123500001],[835544.1503,834915.6568],[835544.6405,834923.034600001],[835545.3757,834930.675799999],[835546.3561,834946.485400001],[835547.8609,834951.7541],[835549.7855,834957.8155],[835553.4595,834962.821699999],[835559.0928,834966.7739],[835566.1955,834969.672],[835574.033,834970.725500001],[835619.5877,834970.7235],[835649.4539,834970.4684],[835690.9326,834971.1285],[835717.0653,834972.0373],[835741.5764,834974.999399999],[835767.4057,834980.100500001],[835773.3036,834985.0822],[835775.0183,834991.9329],[835773.4856,834997.5945],[835769.0556,835029.481899999],[835767.414,835066.360300001],[835767.9336,835119.2925],[835768.7503,835141.547499999],[835772.0855,835187.7085],[835784.9195,835313.747],[835788.0206,835357.376700001],[835784.5817,835363.7216]]]}",
                    "bound": 1,
                    "serviceType": 1,
                    "route": "71B"
                }
            },
            "result": true
        };
        const api_stub = Sinon.stub(Common, 'callApi').withArgs({action: 'getstops', route: '71B', bound: '1', serviceType: '1'}).returns(Promise.resolve(json));
        Sinon.stub(Common, 'getLanguage').returns(language);
        const stops = await Stop.get(new Variant(new Route('71B', 1), 1, '大埔(富亨)', '大埔中心(循環線)', ''));
        assert(api_stub.calledOnce);
        assert.deepStrictEqual(
            json.data.routeStops.map(
                item => new Stop(item.BSICode, item[column as keyof typeof item], item.Direction.trim(), Number(item.Seq))
            )
            , stops
        );
    }
}