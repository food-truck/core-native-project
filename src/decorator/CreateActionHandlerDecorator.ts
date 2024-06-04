import {app} from "../app";
import {stringifyWithMask} from "@wonder/core-core";
import type {State} from "../sliceStores";
import type {ActionHandler} from "../module";
/**
 * A helper for ActionHandler functions (Saga).
 */
export function createActionHandlerDecorator<
    ReturnType,
    RootState extends State = State,
    This extends Module<RootState, string> = Module<RootState, string>,
    Fn extends (this: This, ...args: any[]) => Promise<ReturnType> = ActionHandler<ReturnType>,
>(interceptor: HandlerInterceptor<ReturnType>) {
    return (fn: Fn, context: ClassMethodDecoratorContext<This, Fn>) => {
        return async function (this: This, ...args: any[]): Promise<ReturnType> {
            const boundFn: ActionHandlerWithMetaData<ReturnType> = fn.bind(this, ...args) as any;
            // Do not use fn.actionName, it returns undefined
            // The reason is, fn is created before module register(), and the actionName had not been attached then
            boundFn.actionName = (this as any)[context.name].actionName;
            boundFn.maskedParams = stringifyWithMask(app.loggerConfig?.maskedKeywords || [], "***", ...args) || "[No Parameter]";
            return await interceptor(boundFn, this as any);
        };
    };
}

import type {Module} from "../platform/Module";

export type ActionHandlerWithMetaData<ReturnType> = ActionHandler<ReturnType> & {actionName: string; maskedParams: string};

type HandlerInterceptor<ReturnType, RootState extends State = State> = (handler: ActionHandlerWithMetaData<ReturnType>, thisModule: Module<RootState, any>) => Promise<ReturnType>;
