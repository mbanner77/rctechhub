export class Cache {
    private static instance: Cache;
    private static JSONCache: any = new Map(); 
    private static EXPERIMENTAL_FEATURES: boolean = Boolean(process.env.EXPERIMENTAL_FEATURES) || false;

    constructor() {
        console.log(`Cache created. Experimental feature mode is "${Cache.EXPERIMENTAL_FEATURES}".`);
    }

    public static getInstance(): Cache {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }
        return Cache.instance;
    }

    async uploadPdfFile(fileBlob: Buffer, fileNameAndPath: string): Promise<string> {
        return fileNameAndPath;
    }
    async uploadFile(file: object, fileName: string): Promise<boolean> {
        if ( Cache.EXPERIMENTAL_FEATURES === true ) Cache.JSONCache.set(`${fileName}`, file);
        return true;
    }
    async deleteFile(fileNameAndPath: string): Promise<boolean> {
        return true;
    }
    async getFile(fileName: string): Promise<object> {
        let file: any = null;
        if ( Cache.EXPERIMENTAL_FEATURES === true ) file = Cache.JSONCache.get(`${fileName}`);
        return file;
    }
}