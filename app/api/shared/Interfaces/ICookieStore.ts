export interface ICookieStore {
    get: (name: string) => { name: string; value: string } | undefined;
    getAll: () => { name: string; value: string }[];
    has: (name: string) => boolean;
    set: (name: string, value: string, options?: object) => void;
    delete: (name: string) => void;
}