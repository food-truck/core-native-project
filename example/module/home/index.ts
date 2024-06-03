import {Module, NetworkConnectionException, register} from '@wonder/core-native';
import {RootState} from '../../type';
import {HomeScreen} from './component/Home';
const initState = {};

const getList = () =>
    new Promise(res =>
        setTimeout(() => {
            res('success');
        }, 1000),
    );

class HomeModule extends Module<RootState, 'home'> {
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

    async getHomeData(value: string) {
        try {
            await this.executeAsync(getList, 'getHomeData');
            if (value === 'error') {
                throw new NetworkConnectionException('network error', '');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}
const module = register(new HomeModule('home', initState));
export const homeActions = module.getActions();
export const Home = module.attachLifecycle<any>(HomeScreen);
