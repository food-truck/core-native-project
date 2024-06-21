import {setLoadingState, createActionHandlerDecorator, type ActionHandlerWithMetaData} from "@wonder/core-core";

/**
 * To mark state.loading[identifier] during action execution.
 */
export function Loading<ReturnType>(identifier: string = "global", initialLoading?: boolean) {
    if (initialLoading) {
        setLoadingState({
            identifier,
            show: 1,
        });
    }
    return createActionHandlerDecorator(async function (handler: ActionHandlerWithMetaData<ReturnType>) {
        setLoadingState({
            identifier,
            show: 1,
        });
        try {
            return await handler();
        } finally {
            setLoadingState({
                identifier,
                show: initialLoading ? -2 : -1,
            });
        }
    });
}
