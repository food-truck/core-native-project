import {app} from "./app";
import {Exception} from "./Exception";
import {Module, type ModuleLifecycleListener} from "./platform/Module";
import {ModuleProxy} from "./platform/ModuleProxy";
import {type Action} from "./reducer";
import {type SagaGenerator} from "./typed-saga";
import {stringifyWithMask} from "./util/json-util";
import {captureError} from "./util/error-util";
import {setAppState} from "./sliceActions";

export interface TickIntervalDecoratorFlag {
    tickInterval?: number;
}

export type ActionHandler<ReturnType> = (...args: any[]) => Promise<ReturnType> | void;

export type ErrorHandler = (error: Exception) => SagaGenerator;

export interface ErrorListener {
    onError: ErrorHandler;
}

type ActionCreator<H> = H extends (...args: infer P) => Promise<infer ReturnType> ? (...args: P) => Promise<ReturnType> : never;
type HandlerKeys<H> = {[K in keyof H]: H[K] extends (...args: any[]) => Promise<any> ? K : never}[Exclude<keyof H, keyof ModuleLifecycleListener | keyof ErrorListener>];
export type ActionCreators<H> = {readonly [K in HandlerKeys<H>]: ActionCreator<H[K]>};

export function register<M extends Module<any, any>>(module: M): ModuleProxy<M> {
    const moduleName = module.name;
    if (!app.store.getState().app[moduleName]) {
        // To get private property
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
        method.actionName = `${moduleName}/${actionType}`;
        actions[actionType] = method.bind(module);
    });

    return new ModuleProxy(module, actions);
}

export async function executeAction<ReturnType>({actionName, handler, payload}: {actionName: string; handler: ActionHandler<ReturnType>; payload: any[]}) {
    try {
        await handler(...payload);
    } catch (error) {
        const actionPayload = stringifyWithMask(app.loggerConfig?.maskedKeywords || [], "***", ...payload) || "[No Parameter]";
        captureError(error, actionName, {actionPayload});
    }
}

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
