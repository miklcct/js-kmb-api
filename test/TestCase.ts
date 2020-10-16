import Sinon from "sinon";

export abstract class TestCase {
    after() : void {
        Sinon.restore();
        localStorage.clear();
        sessionStorage.clear();
    }
}