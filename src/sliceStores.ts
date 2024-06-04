import {createStore} from "@wonder/core-core";
import type {AppState, LoadingState} from "@wonder/core-core/lib/sliceStores";

export interface State {
    app: AppState;
    loading: LoadingState;
}

const loadingStore = createStore<LoadingState>(() => ({}));

const appStore = createStore<AppState>(() => ({}));

export const store = {
    loading: loadingStore,
    app: appStore,
};
