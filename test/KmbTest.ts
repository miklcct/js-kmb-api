import nock = require('nock');
import {TestCase} from "./TestCase";
import {suite, test, params} from "@testdeck/mocha";
import Kmb from "../src";
import Sinon = require("sinon");
import {assert} from "chai";
import Storage = require('node-storage-shim');

@suite
export class KmbTest extends TestCase {
    @test
    storageIsClearedWhenConstructing() : void {
        const storage = new Storage();
        storage.setItem('foo', 'bar');
        void new Kmb('en', storage);
        assert.isNull(storage.getItem('foo'));
    }

    @test
    storageIsClearedWhenReusingStorageAtPreviousVersion() : void {
        const storage = new Storage();
        void new Kmb('en', storage);
        storage.setItem('foo', 'bar');
        storage.setItem(Kmb.STORAGE_VERSION_KEY, String(Number(storage.getItem(Kmb.STORAGE_VERSION_KEY)) - 1));
        void new Kmb('en', storage);
        assert.isNull(storage.getItem('foo'));
    }

    @test
    storageIsNotClearedWhenReusingStorageAtTheSameVersion() : void {
        const storage = new Storage();
        void new Kmb('en', storage);
        storage.setItem('foo', 'bar');
        void new Kmb('en', storage);
        assert.strictEqual(storage.getItem('foo'), 'bar');
    }

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

    @test
    async callApi() : Promise<void> {
        const result = ['foo', 'bar', 'baz'];
        const query = {foo : 'bar'};
        nock('https://search.kmb.hk/').get('/KMBWebSite/Function/FunctionRequest.ashx').query(query)
            .reply(200, result);
        assert.deepStrictEqual(await (new Kmb()).callApi(query), result);
    }

    @params(['SHAN KING', 'Shan King'], 'Simple Case')
    @params(['WAN CHAI (HKCECE)', 'Wan Chai (Hkcece)'], 'With ()')
    @params(['QUEEN\'S ROAD WEST', 'Queen\'s Road West'], 'With \'')
    @params(['形點 II', '形點 Ii'], 'with Chinese')
    @test toTitleCase([input, expected] : [string, string]) : void {
        assert.strictEqual(Kmb.toTitleCase(input), expected);
    }

    @test convertHkscs() : void {
        assert.strictEqual(Kmb.convertHkscs('深水北河街'), '深水埗北河街');
    }
}