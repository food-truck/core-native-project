import {Exception, JavaScriptException} from "@wonder/core-core";
import {type ErrorHandler} from "../module";
import {app} from "../app";
import {sendEventLogs} from "../platform/bootstrap";

let errorHandlerRunning = false;

interface ErrorExtra {
    severity?: "fatal";
    actionPayload?: string; // Should be masked
    extraStacktrace?: string;
}

export function errorToException(error: unknown): Exception {
    if (error instanceof Exception) {
        return error;
    } else {
        let message: string;
        if (!error) {
            message = "[No Message]";
        } else if (typeof error === "string") {
            message = error;
        } else if (error instanceof Error) {
            message = error.message;
        } else {
            try {
                message = JSON.stringify(error);
            } catch (e) {
                message = "[Unknown]";
            }
        }
        return new JavaScriptException(message, error);
    }
}

export function captureError(error: unknown, action: string, extra: ErrorExtra = {}): Exception {
    if (process.env.NODE_ENV === "development") {
        console.error(`[framework] Error captured from [${action}]`, error);
    }

    const exception = errorToException(error);
    const errorStacktrace = error instanceof Error ? error.stack : undefined;
    const info: {[key: string]: string | undefined} = {
        payload: extra.actionPayload,
        extra_stacktrace: extra.extraStacktrace,
        stacktrace: errorStacktrace,
    };

    app.logger.exception(exception, info, action);
    runUserErrorHandler.call(null, app.errorHandler, exception);

    return exception;
}

export async function runUserErrorHandler(handler: ErrorHandler, exception: Exception) {
    // For app, report errors to event server ASAP, in case of sudden termination
    sendEventLogs();
    if (errorHandlerRunning) return;

    try {
        errorHandlerRunning = true;
        handler(exception);
    } catch (e) {
        console.warn("[framework] Fail to execute error handler", e);
    } finally {
        errorHandlerRunning = false;
    }
}
