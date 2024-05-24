import {app} from "./app";

interface SetStatePayload<T = any> {
    moduleName: string;
    state: T;
}

export const setAppState = <T = any>(payload: SetStatePayload<T>, actionName?: string) => {
    app.store.app.setState(
        draft => {
            draft[payload.moduleName] = payload.state;
        },
        false,
        actionName || "@@framework/setState"
    );
};

interface LoadingActionPayload {
    identifier: string;
    show: boolean;
}

export const setLoadingState = (payload: LoadingActionPayload) => {
    app.store.loading.setState(
        draft => {
            const count = draft[payload.identifier] || 0;
            draft[payload.identifier] = count + (payload.show ? 1 : -1);
        },
        false,
        "@@framework/loading"
    );
};
