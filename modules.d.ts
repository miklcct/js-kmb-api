module "axios/lib/adapters/http.js" {
    import {AxiosAdapter} from 'axios';
    declare const httpAdapter : AxiosAdapter;
    export default httpAdapter;
}