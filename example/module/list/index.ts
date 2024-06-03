import {Module, register} from '@wonder/core-native';
import {RootState} from '../../type';
import {ListScreen} from './component/List';
import {homeActions} from '../home';
import {ListState} from './type';
const initState: ListState = {
    list: null,
};

const getList = (): Promise<
    Array<{
        id: string;
        name: string;
    }>
> =>
    new Promise(res =>
        setTimeout(() => {
            res(
                [...new Array(10)].map((v, i) => ({
                    id: 'id_' + i,
                    name: 'list: ' + (i + 1),
                })),
            );
        }, 1000),
    );

class ListModule extends Module<RootState, 'list'> {
    override async onEnter(routeParameters: object) {
        // console.log('home onEnter');
    }

    onFocus(): void {
        // console.log('home onFocus');
    }

    // @Interval(1);
    override async onTick() {
        // console.log('home onTick');
    }

    async getList() {
        try {
            await homeActions.getHomeData('error');
            const list = await this.executeAsync(getList, 'getList');
            this.setState({list});
        } catch (error) {
            console.log('getList error', error);
            throw error;
        }
    }
    async getList2() {
        homeActions.getHomeData('error');
        const list = await this.executeAsync(getList, 'getList2');
    }
}
const module = register(new ListModule('list', initState));
export const listActions = module.getActions();
export const List = module.attachLifecycle<any>(ListScreen);
