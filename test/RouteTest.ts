import {suite, test, params} from '@testdeck/mocha';
import {assert} from 'chai';
import {TestCase} from "./TestCase";
import Sinon from "sinon";
import Kmb, {Route} from "../src";

@suite
export class RouteTest extends TestCase {
    @test
    getRouteBound(): void {
        assert.strictEqual(new (new Kmb).Route('N260', 2).getRouteBound(), 'N260-2');
    }

    @test
    async getBounds(): Promise<void> {
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
        const api_stub = Sinon.stub(kmb, 'callApi').withArgs({action : 'getroutebound', route : '104'})
            .returns(Promise.resolve(json));
        const result = await kmb.Route.getBounds('104');
        assert(api_stub.calledOnce);
        assert.sameMembers(result, [1, 2]);
    }

    @params(
        [new (new Kmb).Route('58M', 1), new (new Kmb).Route('58M', 1), 0]
        , 'compare same (new Kmb).Route'
    )
    @params(
        [new (new Kmb).Route('58M', 1), new (new Kmb).Route('58M', 0), 1]
        , 'compare same (new Kmb).Route with decreasing bounds'
    )
    @params(
        [new (new Kmb).Route('58M', 1), new (new Kmb).Route('58M', 2), -1]
        , 'compare same (new Kmb).Route with increasing bounds'
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
    compare([a, b, result] : [Route, Route, -1 | 0 | 1]) : void {
        assert.strictEqual((new Kmb).Route.compare(a, b), result);
    }
}