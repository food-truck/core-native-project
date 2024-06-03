import {app} from "./app";
import {Exception} from "./Exception";
import {Module} from "./platform/Module";
import {ModuleProxy} from "./platform/ModuleProxy";
import {setAppState} from "./storeActions";
import {captureError} from "./util/error-util";
import {stringifyWithMask} from "./util/json-util";

export interface TickIntervalDecoratorFlag {
    tickInterval?: number;
}

export type ErrorHandler = (error: Exception) => void;

export interface ErrorListener {
    onError: ErrorHandler;
}

export type ActionHandler<ReturnType> = (...args: any[]) => Promise<ReturnType>;

export function register<M extends Module<any, any>>(module: M): ModuleProxy<M> {
    const moduleName: string = module.name;
    if (!app.getState("app")[moduleName]) {
        setAppState(
            {
                moduleName,
                state: module.initialState,
            },
            `@@${moduleName}/@@init`
        );
    }

    // Transform every method into ActionCreator
    const actions: any = {};
    getMethods(module).forEach(({name: actionType, method}) => {
        // Attach action name, for @Log / error handler reflection
        const qualifiedActionType = `${moduleName}/${actionType}`;
        method.actionName = qualifiedActionType;
        actions[actionType] = method.bind(module);
    });
    return new ModuleProxy(module, actions);
}

export const executeAction = async ({actionName, handler, payload}: {actionName: string; handler: Function; payload: any[]}) => {
    try {
        await handler(...payload);
    } catch (error) {
        const actionPayload = stringifyWithMask(app.loggerConfig?.maskedKeywords || [], "***", ...payload) || "[No Parameter]";
        captureError(error, actionName, {actionPayload});
    }
};

function getMethods<M extends Module<any, any>>(module: M): Array<{name: string; method: any}> {
    // Do not use Object.keys(Object.getPrototypeOf(module)), because class methods are not enumerable
    const keys: Array<{name: string; method: any}> = [];
    for (const propertyName of Object.getOwnPropertyNames(Object.getPrototypeOf(module))) {
        const method = Reflect.get(module, propertyName);
        if (method instanceof Function && propertyName !== "constructor") {
            keys.push({name: propertyName, method});
        }
    }
    return keys;
}
