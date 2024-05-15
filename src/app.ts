import {LoggerImpl, type LoggerConfig, type Logger} from "./Logger";
import {type ErrorHandler} from "./module";
import {store, type State} from "./sliceStores";

declare const window: any;

interface App {
    readonly store: typeof store;
    readonly logger: LoggerImpl;
    loggerConfig: LoggerConfig | null;
    errorHandler: ErrorHandler;
    getState: <K extends keyof State>(key: K) => State[K];
}

export const app = createApp();
export const logger: Logger = app.logger;

function createApp(): App {
    const eventLogger = new LoggerImpl();

    return {
        getState: <K extends keyof State>(key: keyof typeof store) => store[key].getState() as State[K],
        store,
        logger: eventLogger,
        loggerConfig: null,
        *errorHandler() {},
    };
}
