import Common from "./Common";

export default class IncompleteStop {
    public readonly id: string;
    public constructor(id : string) {
        this.id = id;
    }

    public get streetId() : string{
        return this.id.split('-')[0];
    }

    public get streetDirection() : string {
        return this.id.split('-')[1];
    }

    get name() : string | null {
        return localStorage[`${this.id}_${Common.getLanguage()}`] ?? null;
    }
}

