import {coreApp, type Logger} from "@wonder/core-core";
import {type ErrorHandler} from "./module";
import {type State} from "./sliceStores";
import {LoggerImpl, type LoggerConfig} from "./Logger";

interface App {
    readonly store: typeof coreApp.store;
    readonly logger: LoggerImpl;
    loggerConfig: LoggerConfig | null;
    errorHandler: ErrorHandler;
    getState: <K extends keyof State>(key: K) => State[K];
    actionControllers: Record<string, Record<string, AbortController>>;
}

export const app = createApp();
export const logger: Logger = app.logger;

function createApp(): App {
    return {
        getState: <K extends keyof State>(key: keyof typeof coreApp.store) => coreApp.store[key].getState() as State[K],
        store: coreApp.store,
        logger: new LoggerImpl(),
        loggerConfig: null,
        errorHandler() {},
        actionControllers: {},
    };
}
