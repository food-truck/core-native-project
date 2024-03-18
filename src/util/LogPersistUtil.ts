import type {Log} from "../Logger";
import {CustomMMKV} from "./mmkv";

export interface PersistInstance {
    onCreate: (log: Log) => void;
    recover: () => Log[];
    clear: () => void;
    onDelete: (keys: string[]) => void;
    count: () => number;
}

export const logStorage = new CustomMMKV({
    id: "core-native-logs",
});

export class PersistInstanceImpl implements PersistInstance {
    recover = () => logStorage.getAllKeys().map(key => logStorage.getObject<Log>(key));
    onDelete = (keys: string[]) => {
        keys.forEach(key => logStorage.delete(key));
    };
    onCreate = (log: Log) => {
        logStorage.setObject(log._id, log);
    };
    clear = () => logStorage.clearAll();
    count = () => logStorage.getAllKeys().length;
}
