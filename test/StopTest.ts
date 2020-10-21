import {suite, test} from '@testdeck/mocha';
import {assert} from 'chai';
import Kmb from "../src";
import {TestCase} from "./TestCase";

@suite
export class StopTest extends TestCase {
    @test
    storageIsSetWhenConstructed(): void {
        const storage = new Storage;
        // noinspection ObjectAllocationIgnored
        new (new Kmb('en', storage)).Stop('EX01-C-1000-0', 'Example', 'I', 15);
        assert(storage.getItem('EX01-C-1000-0_en') === 'Example');
    }
}