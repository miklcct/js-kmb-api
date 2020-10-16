import { assert } from 'chai';
import { suite, test } from '@testdeck/mocha';
import IncompleteStop from '../src/IncompleteStop';
import Sinon from 'sinon';
import Common from '../src/Common';
import {TestCase} from "./TestCase";

@suite
export class IncompleteStopTest extends TestCase {
    @test
    streetIdIsParsedCorrectly() : void {
        assert.strictEqual(new IncompleteStop('CA07-S-2800-0').streetId, 'CA07');
    }

    @test
    streetDirectionIsParsedCorrecly() : void {
        assert.strictEqual(new IncompleteStop('CA07-S-2800-0').streetDirection, 'S');
    }

    @test
    nameIsNullWhenLocalStorageIsEmpty() : void {
        localStorage.clear();
        Sinon.stub(Common, 'getLanguage').returns('zh-hans');
        assert.isNull(new IncompleteStop('TS06-S-1000-0').name);
    }

    @test
    nameIsReadFromLocalStorage() : void {
        localStorage.setItem('TS06-S-1000-0_zh-hans', '青雲站');
        Sinon.stub(Common, 'getLanguage').returns('zh-hans');
        assert.strictEqual(new IncompleteStop('TS06-S-1000-0').name, '青雲站');
    }
}

