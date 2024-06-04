import {LoggerImpl, type LoggerConfig, type Logger, coreApp} from "@wonder/core-core";
import {type ErrorHandler} from "./module";
import {store, type State} from "./sliceStores";

interface App {
    readonly store: typeof store & typeof coreApp.store;
    readonly logger: LoggerImpl;
    loggerConfig: LoggerConfig | null;
    errorHandler: ErrorHandler;
    getState: <K extends keyof State>(key: K) => State[K];
    actionControllers: Record<string, Record<string, AbortController>>;
}

export const app = createApp();
export const logger: Logger = app.logger;

function createApp(): App {
    const combineStore = Object.assign(coreApp.store, store);
    return {
        getState: <K extends keyof State>(key: keyof typeof store) => combineStore[key].getState() as State[K],
        store: combineStore,
        logger: new LoggerImpl(),
        loggerConfig: null,
        errorHandler() {},
        actionControllers: {},
    };
}
