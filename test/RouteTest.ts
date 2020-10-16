import {suite, test, params} from '@testdeck/mocha';
import {assert} from 'chai';
import {TestCase} from "./TestCase";
import Route from "../src/Route";
import Sinon from "sinon";
import Common from "../src/Common";

@suite
export class RouteTest extends TestCase {
    @test
    getRouteBound(): void {
        assert.strictEqual(new Route('N260', 2).getRouteBound(), 'N260-2');
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
        const api_stub = Sinon.stub(Common, 'callApi').withArgs({action : 'getroutebound', route : '104'})
            .returns(Promise.resolve(json));
        const result = await Route.getBounds('104');
        assert(api_stub.calledOnce);
        assert.sameMembers(result, [1, 2]);
    }

    @params(
        [new Route('58M', 1), new Route('58M', 1), 0]
        , 'compare same route'
    )
    @params(
        [new Route('58M', 1), new Route('58M', 0), 1]
        , 'compare same route with decreasing bounds'
    )
    @params(
        [new Route('58M', 1), new Route('58M', 2), -1]
        , 'compare same route with increasing bounds'
    )
    @params(
        [new Route('44', 2), new Route('44P', 2), -1]
        , 'compare routes without and with suffix'
    )
    @params(
        [new Route('44P', 1), new Route('44', 1), 1]
        , 'compare routes with and without suffix'
    )
    @params(
        [new Route('58M', 2), new Route('58X', 1), -1]
        , 'compare routes with increasing suffix'
    )
    @params(
        [new Route('58X', 1), new Route('58M', 2), 1]
        , 'compare routes with decreasing suffix'
    )
    @params(
        [new Route('99R', 2), new Route('101', 1), -1]
        , 'compare routes with increasing number'
    )
    @params(
        [new Route('101', 1), new Route('99R', 2), 1]
        , 'compare routes with decreasing number'
    )
    @params(
        [new Route('99R', 2), new Route('101', 1), -1]
        , 'compare routes with increasing number'
    )
    @params(
        [new Route('985', 2), new Route('A33X', 1), -1]
        , 'compare routes beginning with a number and a letter'
    )
    @params(
        [new Route('A33X', 2), new Route('985', 1), 1]
        , 'compare routes beginning with a letter and a number'
    )
    compare([a, b, result] : [Route, Route, -1 | 0 | 1]) : void {
        assert.strictEqual(Route.compare(a, b), result);
    }
}