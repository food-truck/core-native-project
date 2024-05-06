import {LoggerImpl, type LoggerConfig, type Logger} from "./Logger";
import {type ErrorHandler} from "./module";
import {createRootStore, type State} from "./sliceStores";

declare const window: any;

interface App {
    readonly store: ReturnType<typeof createRootStore>;
    readonly logger: LoggerImpl;
    loggerConfig: LoggerConfig | null;
    errorHandler: ErrorHandler;
    getState: <K extends keyof State>(key: K) => State[K];
}

export const app = createApp();
export const logger: Logger = app.logger;

function createApp(): App {
    const eventLogger = new LoggerImpl();
    const store = createRootStore();

    return {
        getState: key => app.store.getState()[key],
        store,
        logger: eventLogger,
        loggerConfig: null,
        *errorHandler() {},
    };
}
