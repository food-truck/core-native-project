import {create, type StateCreator, type StoreMutatorIdentifier} from "zustand";
import {immer} from "zustand/middleware/immer";
import {devtools, subscribeWithSelector} from "zustand/middleware";

export type ImmerStateCreator<T, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []> = StateCreator<T, [...Mps, ["zustand/immer", never]], Mcs>;
export interface Slice {}

export interface LoadingState {
    [key: string]: any;
}

export interface AppState {
    [module: string]: any;
}

export interface State {
    app: AppState;
    loading: LoadingState;
}

export type StoreType = ReturnType<typeof createStore>;

export const createStore = <T extends object>(creater: ImmerStateCreator<T>) => create<T>()(subscribeWithSelector(immer(devtools(creater))));

const loadingStore = createStore<LoadingState>(() => ({}));

const appStore = createStore<AppState>(() => ({}));

export const store = {
    loading: loadingStore,
    app: appStore,
};
