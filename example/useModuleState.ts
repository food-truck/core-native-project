import {useSelector} from '@wonder/core-native';
import {useMemo} from 'react';
import {RootState} from './type';

export const useModuleState = <T extends keyof RootState['app']>(moduleStateName: T): RootState['app'][T] => {
    const state = useSelector(state => (state as RootState['app'])[moduleStateName]);

    return useMemo(() => state ?? {}, [state]);
};
