import {Interval, Loading, APIException, register} from '@wonder/core-native';
import {Module} from '@wonder/core-native';
import {RootState} from '../../type';
import {HomeScreen} from './component/Home';
const initState = {};

const getList = () =>
    new Promise(res =>
        setTimeout(() => {
            res('success');
        }, 3000),
    );

class HomeModule extends Module<RootState, 'home'> {
    override async onEnter(routeParameters: object) {
        super.onEnter(routeParameters);
        // console.log('home onEnter');
    }

    onFocus(): void {
        // console.log('home onFocus');
    }

    @Interval(1)
    override async onTick() {}

    @Loading('getHomeData')
    async getHomeData(value: string) {
        try {
            await this.executeAsync(getList, 'getHomeData');
            if (value === 'error') {
                throw new APIException('network error', 401, '', {}, 'idid', 'error');
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
