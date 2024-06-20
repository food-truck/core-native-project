import {createActionHandlerDecorator, type ActionHandlerWithMetaData} from "@wonder/core-core";

/**
 * To add a log item for action, with execution duration, action name, and masked action parameters.
 */
export function Log<ReturnType>() {
    return createActionHandlerDecorator(async function (handler: ActionHandlerWithMetaData<ReturnType>, thisModule) {
        const startTime = Date.now();
        try {
            return await handler();
        } finally {
            thisModule.logger.info({
                action: handler.actionName,
                elapsedTime: Date.now() - startTime,
                info: {payload: handler.maskedParams},
            });
        }
    });
}
