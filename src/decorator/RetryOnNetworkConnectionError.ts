import {app} from "../app";
import {NetworkConnectionException, delay, createActionHandlerDecorator, type ActionHandlerWithMetaData} from "@wonder/core-core";

/**
 * Re-execute the action if NetworkConnectionException is thrown.
 * A warning log will be also created, for each retry.
 */
export function RetryOnNetworkConnectionError<ReturnType>(retryIntervalSecond: number = 3) {
    return createActionHandlerDecorator(async function (handler: ActionHandlerWithMetaData<ReturnType>) {
        let retryTime = 0;
        async function callback() {
            try {
                return await handler();
            } catch (e) {
                if (e instanceof NetworkConnectionException) {
                    retryTime++;
                    app.logger.exception(
                        e,
                        {
                            payload: handler.maskedParams,
                            process_method: `will retry #${retryTime}`,
                        },
                        handler.actionName
                    );
                    await delay(retryIntervalSecond * 1000);
                    return callback();
                } else {
                    throw e;
                }
            }
        }
        return callback();
    });
}
