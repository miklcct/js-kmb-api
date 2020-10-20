import {assert} from 'chai';
import {suite, test} from '@testdeck/mocha';
import Kmb from '../src';
import {TestCase} from "./TestCase";

@suite
export class IncompleteStopTest extends TestCase {
    @test
    streetIdIsParsedCorrectly() : void {
        assert.strictEqual(new (new Kmb).IncompleteStop('CA07-S-2800-0').streetId, 'CA07');
    }

    @test
    streetDirectionIsParsedCorrecly() : void {
        assert.strictEqual(new (new Kmb).IncompleteStop('CA07-S-2800-0').streetDirection, 'S');
    }

    @test
    nameIsUndefinedWithoutStorageIsEmpty() : void {
        assert.isUndefined(new new Kmb().IncompleteStop('TS06-S-1000-0').name);
    }

    @test
    nameIsUndefinedWhenStorageIsEmpty() : void {
        assert.isUndefined(new new Kmb('en', new Storage).IncompleteStop('TS06-S-1000-0').name);
    }

    @test
    nameIsReadFromLocalStorage() : void {
        const storage = new Storage;
        storage.setItem('TS06-S-1000-0_zh-hans', '青雲站');
        assert.strictEqual(new new Kmb('zh-hans', storage).IncompleteStop('TS06-S-1000-0').name, '青雲站');
    }
}

