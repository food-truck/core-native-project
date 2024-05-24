/**
 * For React Native, the caller is responsible for providing deviceId/route etc. to logger context.
 *
 * Only sessionId is provided here.
 * Session ID is fixed during app lifecycle (till full exit from phone memory).
 * A new session ID is generated for next use.
 */

import {generateUniqueId} from "../util/generateUniqueId";

export const loggerContext = {
    session_id: generateUniqueId(),
};
