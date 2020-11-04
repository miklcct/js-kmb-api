module "axios/lib/adapters/http" {
    import {AxiosAdapter} from 'axios';
    declare const httpAdapter : AxiosAdapter;
    export = httpAdapter;
}

module "ssl-root-cas" {
    interface RootCas extends Array<string> {
        inject(this : undefined | RootCas) : RootCas,
        addFile(this : undefined | RootCas, file : string) : RootCas,
    }

    interface rootCas extends RootCas {
        rootCas : rootCas;
        create() : RootCas;
    }

    declare const rootCas : rootCas;
    export = rootCas;
}

module "ssl-root-cas/latest" {
    import rootCas = require("ssl-root-cas");
    declare const rootCas : rootCas;
    export = rootCas;
}

module "hkscs_converter" {
    declare const hkscsConverter : {convertCharacter : (char : string) => string, convertString : (str : string) => string};
    export = hkscsConverter;
}