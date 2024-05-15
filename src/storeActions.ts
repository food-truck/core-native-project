import {app} from "./app";

// Redux State
interface LoadingState {
    [loading: string]: number;
}

export interface State {
    loading: LoadingState;
    app: {
        [key: string]: object;
    };
}

interface SetStatePayload<T = any> {
    moduleName: string;
    state: T;
}

export const setAppState = <T extends object>(payload: SetStatePayload<T>, actionName?: string) => {
    app.store.app.setState(
        draft => {
            draft.app[payload.moduleName] = payload.state;
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
            const count = draft.loading[payload.identifier] || 0;
            draft.loading[payload.identifier] = count + (payload.show ? 1 : -1);
        },
        false,
        "@@framework/loading"
    );
};
