import {app} from "./app";
import {Exception} from "./Exception";
import {Module, type ModuleLifecycleListener} from "./platform/Module";
import {ModuleProxy} from "./platform/ModuleProxy";
import {type Action, setStateAction} from "./reducer";
import {type SagaGenerator} from "./typed-saga";
import {stringifyWithMask} from "./util/json-util";
import {captureError} from "./util/error-util";

export interface TickIntervalDecoratorFlag {
    tickInterval?: number;
}

export type ActionHandler = (...args: any[]) => SagaGenerator;

export type ErrorHandler = (error: Exception) => SagaGenerator;

export interface ErrorListener {
    onError: ErrorHandler;
}

type ActionCreator<H> = H extends (...args: infer P) => SagaGenerator ? (...args: P) => Action<P> : never;
type HandlerKeys<H> = {[K in keyof H]: H[K] extends (...args: any[]) => SagaGenerator ? K : never}[Exclude<keyof H, keyof ModuleLifecycleListener | keyof ErrorListener>];
export type ActionCreators<H> = {readonly [K in HandlerKeys<H>]: ActionCreator<H[K]>};

export function register<M extends Module<any, any>>(module: M): ModuleProxy<M> {
    const moduleName = module.name;
    if (!app.store.getState().app[moduleName]) {
        // To get private property
        app.store.dispatch(setStateAction(moduleName, module.initialState, `@@${moduleName}/@@init`));
    }

    // Transform every method into ActionCreator
    const actions: any = {};
    getMethods(module).forEach(({name: actionType, method}) => {
        // Attach action name, for @Log / error handler reflection
        const qualifiedActionType = `${moduleName}/${actionType}`;
        method.actionName = qualifiedActionType;
        actions[actionType] = (...payload: any[]): Action<any[]> => ({type: qualifiedActionType, payload});

        app.actionHandlers[qualifiedActionType] = method.bind(module);
    });

    return new ModuleProxy(module, actions);
}

export function* executeAction(actionName: string, handler: ActionHandler, ...payload: any[]): SagaGenerator {
    try {
        yield* handler(...payload);
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
