import {Text, View} from 'react-native';
import {useModuleState} from '../../../useModuleState';
import {homeActions} from '..';
import {useEffect} from 'react';
import {useLoadingStatus} from '@wonder/core-native';
import {NavigationProp, useNavigation} from '@react-navigation/native';

export const HomeScreen = () => {
    const {} = useModuleState('home');
    const loading = useLoadingStatus('getTodoList');
    const navigation = useNavigation<
        NavigationProp<{
            List: undefined;
        }>
    >();
    useEffect(() => {
        homeActions.getHomeData('');
    }, []);
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text
                onPress={() => {
                    navigation.navigate('List');
                }}>
                Home Screen 12
            </Text>
        </View>
    );
};
