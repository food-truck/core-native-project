import {MMKV} from "react-native-mmkv";

export class CustomMMKV extends MMKV {
    getObject<T extends object | null>(key: string, initValue: T = null as T): T {
        const res = this.getString(key);
        if (res) {
            const result = JSON.parse(res);
            return result;
        }
        this.delete(key);
        return initValue;
    }
    setObject<T extends object | null>(key: string | string, value: T) {
        const data = JSON.stringify(value);
        if (value && Object.keys(value).length) {
            this.set(key, data);
        } else {
            this.delete(key);
        }
    }
}
