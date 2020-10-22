import Chai from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import Sinon from "sinon";

export abstract class TestCase {
    before() : void {
        Chai.use(ChaiAsPromised);
    }
    after() : void {
        Sinon.restore();
    }
}