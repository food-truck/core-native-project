import {setLoadingState} from "@wonder/core-core";
import {createActionHandlerDecorator, type ActionHandlerWithMetaData} from "./CreateActionHandlerDecorator";

/**
 * To mark state.loading[identifier] during action execution.
 */
export function Loading<ReturnType>(identifier: string = "global") {
    return createActionHandlerDecorator(async function (handler: ActionHandlerWithMetaData<ReturnType>) {
        setLoadingState({
            identifier,
            show: true,
        });
        try {
            return await handler();
        } finally {
            setLoadingState({
                identifier,
                show: false,
            });
        }
    });
}
