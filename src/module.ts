import {Exception, stringifyWithMask, coreRegister} from "@wonder/core-core";
import {app} from "./app";
import {ModuleProxy} from "./platform/ModuleProxy";
import {captureError} from "./util/error-util";

export interface TickIntervalDecoratorFlag {
    tickInterval?: number;
}

export type ErrorHandler = (error: Exception) => void;

export interface ErrorListener {
    onError: ErrorHandler;
}

export type ActionHandler<ReturnType> = (...args: any[]) => Promise<ReturnType>;

export const register = coreRegister(ModuleProxy<any>);
export const executeAction = async ({actionName, handler, payload}: {actionName: string; handler: Function; payload: any[]}) => {
    try {
        await handler(...payload);
    } catch (error) {
        const actionPayload = stringifyWithMask(app.loggerConfig?.maskedKeywords || [], "***", ...payload) || "[No Parameter]";
        captureError(error, actionName, {actionPayload});
    }
};
