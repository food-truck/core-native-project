import {State} from '@wonder/core-native';
import {HomeState} from './module/home/type';
import {ListState} from './module/list/type';

export interface RootState extends State {
    app: {
        home: HomeState;
        list: ListState;
    };
}
