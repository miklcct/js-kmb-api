import Sinon = require("sinon");

export abstract class TestCase {
    after() : void {
        Sinon.restore();
    }
}