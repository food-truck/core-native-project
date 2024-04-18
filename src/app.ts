import {LoggerImpl, type LoggerConfig, type Logger} from "./Logger";
import {type ErrorHandler} from "./module";
import {createRootStore} from "./storeActions";

declare const window: any;

interface App {
    readonly store: ReturnType<typeof createRootStore>;
    readonly logger: LoggerImpl;
    loggerConfig: LoggerConfig | null;
    errorHandler: ErrorHandler;
}

export const app = createApp();
export const logger: Logger = app.logger;

function createApp(): App {
    const eventLogger = new LoggerImpl();
    const store = createRootStore();

    return {
        store,
        logger: eventLogger,
        loggerConfig: null,
        *errorHandler() {},
    };
}
