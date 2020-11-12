import aesjs = require("aes-js");

export default class Secret {
    constructor(public readonly apiKey : string, public readonly ctr : number) {
    }

    public static getSecret(string : string, counter = Math.floor(Math.random() * (1 << 30))) : Secret {
        const hex_string = counter.toString(16);
        const verifier = '0'.repeat(32 - hex_string.length) + hex_string;
        const cipher = new aesjs.ModeOfOperation.ctr(Secret.KEY, new aesjs.Counter(aesjs.utils.hex.toBytes(verifier)));
        return new Secret(aesjs.utils.hex.fromBytes(cipher.encrypt(aesjs.utils.utf8.toBytes(string))).toUpperCase(), counter);
    }

    public static readonly VENDOR_ID = (() => {
        let vendor_id = '';
        for (let i = 0; i < 16; ++i) {
            vendor_id += Math.floor(Math.random() * 16).toString(16);
        }
        return vendor_id;
    })();

    public static btoa(b : string) : string {
        return typeof btoa !== 'undefined' ? btoa(b) : Buffer.from(b).toString('base64');
    }

    public static atob(a : string) : string {
        return typeof atob !== 'undefined' ? atob(a) : Buffer.from(a, 'base64').toString();
    }

    private static xorByteArrays(a : Uint8Array, b : Uint8Array) : Uint8Array {
        const result = [];
        for (let i = 0; i < a.length; ++i) {
            result[i] = a[i] ^ b[i % b.length];
        }
        return new Uint8Array(result);
    }

    private static encodeString(base64String : string, page : string) : string {
        return aesjs.utils.utf8.fromBytes(Secret.xorByteArrays(aesjs.utils.utf8.toBytes(Secret.atob(base64String)), aesjs.utils.utf8.toBytes(page)));
    }

    private static readonly SECRET_STRING =
        Secret.encodeString('CCNzfiQsIDQ8MQ==', 'KMBMainView')
        + Secret.encodeString('ES4YfCcoJwUKEzN4', 'KMBMainView')
        + Secret.encodeString('fnwbCDQfJxMaFS4=', 'KMBMainView')
        + Secret.encodeString('ej0GBw0jCxJaXUo=', 'KMBMainView');

    private static readonly KEY = aesjs.utils.hex.toBytes(Secret.encodeString(Secret.SECRET_STRING, 'KMBSplashScreen'));
}

