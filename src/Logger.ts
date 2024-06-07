import "react-native-get-random-values";
import type {PersistInstance} from "./util/LogPersistUtil";
import {LoggerImpl as CoreLoggerImpl, type Log, type InfoLogEntry, type ErrorLogEntry, type LoggerConfig as CoreLoggerConfig} from "@wonder/core-core";

const OUTDATED_TIME_MILLISECONDS = 7 * 24 * 60 * 60 * 1000; // logs before 7 days is outdated

/**
 * If eventLogger config is provided in non-DEV environment.
 * All collected logs will automatically sent to {serverURL} in a regular basis.
 *
 * The request will be PUT to the server in the following format:
 *      {events: Log[]}
 *
 * @param persist enable log persistence
 * @param customPersistInstance use customized tool to persist logs, MMKV is the default solution
 */

type PersistConfig =
    | {persist?: false; customPersistInstance?: never}
    | {
          persist: true;
          customPersistInstance?: PersistInstance;
      };

export type LoggerConfig = PersistConfig & CoreLoggerConfig;

export class LoggerImpl extends CoreLoggerImpl {
    private persistInstance: PersistInstance | undefined;

    persist(persistInstance: PersistInstance) {
        this.persistInstance = persistInstance;
        const persistedLogs = this.persistInstance.recover();
        this.logQueue.forEach(log => this.persistInstance?.onCreate(log));
        this.logQueue = this.logQueue.concat(persistedLogs);
    }

    countPersisted() {
        return this.persistInstance?.count();
    }

    override emptyLastCollection(): void {
        if (this.persistInstance) {
            const logsToClear = this.logQueue.slice(0, this.collectPosition);
            this.persistInstance.onDelete(logsToClear.map(log => log._id));
        }
        this.logQueue = this.logQueue.slice(this.collectPosition);
    }

    clearOutdatedLogs(logs: Log[]): void {
        if (this.persistInstance) {
            const outdatedDate = Date.now() - OUTDATED_TIME_MILLISECONDS;
            this.persistInstance.onDelete(logs.filter(log => log.date.getTime() < outdatedDate).map(log => log._id));
        }
    }

    clearAllCache(): void {
        if (this.persistInstance) {
            this.persistInstance.clear();
        }
    }

    override createLog(result: "OK" | "WARN" | "ERROR", entry: InfoLogEntry | ErrorLogEntry) {
        const event = super.createLog(result, entry);
        this.persistInstance?.onCreate(event);
        return event;
    }
}
