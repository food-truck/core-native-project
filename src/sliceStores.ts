import {createStore} from "@wonder/core-core";
import type {AppState, LoadingState} from "@wonder/core-core/lib/sliceStores";

export type StoreType = ReturnType<typeof createStore>;

export interface State {
    app: AppState;
    loading: LoadingState;
}
