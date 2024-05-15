import {NetworkConnectionException} from "../Exception";
import {type ActionHandlerWithMetaData, createActionHandlerDecorator} from "./CreateActionHandlerDecorator";
import {app} from "../app";

/**
 * Do nothing (only create a warning log) if NetworkConnectionException is thrown.
 * Mainly used for background tasks.
 */
export function SilentOnNetworkConnectionError<ReturnType>() {
    return createActionHandlerDecorator(async function (handler: ActionHandlerWithMetaData<ReturnType>) {
        try {
            return await handler();
        } catch (e) {
            if (e instanceof NetworkConnectionException) {
                app.logger.exception(
                    e,
                    {
                        payload: handler.maskedParams,
                        process_method: "silent",
                    },
                    handler.actionName
                );
                throw e;
            } else {
                throw e;
            }
        }
    });
}
