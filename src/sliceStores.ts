import {create, type StateCreator, type StoreMutatorIdentifier} from "zustand";
import {immer} from "zustand/middleware/immer";
import {devtools, subscribeWithSelector} from "zustand/middleware";
import * as process from "node:process";

export type ImmerStateCreator<T, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []> = StateCreator<T, [...Mps, ["zustand/immer", never]], Mcs>;
export interface Slice {}

export interface LoadingSlice extends Slice {
    loading: {
        [key: string]: number;
    };
}

export interface SetStateSlice extends Slice {
    app: {
        [module: string]: object;
    };
}

export type State = LoadingSlice & SetStateSlice;

export const createLoadingSlice: ImmerStateCreator<LoadingSlice> = set => ({
    loading: {},
});

export const createSetStateSlice: ImmerStateCreator<SetStateSlice> = set => ({
    app: {},
});

export const createRootStore = () =>
    create<State>()(
        subscribeWithSelector(
            immer(
                devtools(
                    (...a) => ({
                        ...createLoadingSlice(...a),
                        ...createSetStateSlice(...a),
                    }),
                    {
                        enabled: process.env.NODE_ENV === "development",
                    }
                )
            )
        )
    );
