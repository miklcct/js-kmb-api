import {TestCase} from "./TestCase";
import {test} from "@testdeck/mocha";
import Kmb from "../src";
import Sinon from "sinon";
import {assert} from "chai";

export class KmbTest extends TestCase {
    @test
    async getRoutes(): Promise<void> {
        const json = {
            "data": [
                {"SERVICE_TYPE": 1, "BOUND": 1, "ROUTE": "104"},
                {"SERVICE_TYPE": 2, "BOUND": 1, "ROUTE": "104"},
                {"SERVICE_TYPE": 3, "BOUND": 1, "ROUTE": "104"},
                {"SERVICE_TYPE": 4, "BOUND": 1, "ROUTE": "104"},
                {"SERVICE_TYPE": 1, "BOUND": 2, "ROUTE": "104"},
                {"SERVICE_TYPE": 2, "BOUND": 2, "ROUTE": "104"},
                {"SERVICE_TYPE": 5, "BOUND": 2, "ROUTE": "104"},
                {"SERVICE_TYPE": 7, "BOUND": 2, "ROUTE": "104"}
            ],
            "result": true
        };
        const kmb = new Kmb;
        const api_stub = Sinon.stub(kmb, 'callApi').returns(Promise.resolve(json));
        const result = await kmb.getRoutes('104');
        assert(api_stub.calledWithExactly({action : 'getroutebound', route : '104'}));
        assert.sameDeepMembers(result, [new kmb.Route('104', 1), new kmb.Route('104', 2)]);
    }
}