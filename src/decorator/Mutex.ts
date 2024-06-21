import {createActionHandlerDecorator, type ActionHandlerWithMetaData} from "@wonder/core-core";

/**
 * If specified, the action cannot be entered by other sagas during execution.
 * For error handler action, mutex logic is auto added.
 */
export function Mutex<ReturnType>() {
    let lockTime: number | null = null;
    return createActionHandlerDecorator(async function (handler: ActionHandlerWithMetaData<ReturnType | void>, thisModule) {
        if (lockTime) {
            thisModule.logger.info({
                action: handler.actionName,
                info: {payload: handler.maskedParams},
                stats: {mutex_locked_duration: Date.now() - lockTime},
            });
        } else {
            try {
                return await handler();
            } finally {
                lockTime = null;
            }
        }
    });
}
