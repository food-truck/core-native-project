import {Button, Text, View} from 'react-native';
import {useModuleState} from '../../../useModuleState';
import {useEffect} from 'react';
import {useLoadingStatus} from '@wonder/core-native';
import {listActions} from '..';

export const ListScreen = () => {
    const {list} = useModuleState('list');

    const fetchData = async () => {
        await listActions.getList();
    };
    const fetchData2 = async () => {
        await listActions.getList2();
    };

    useEffect(() => {}, []);

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>List Screen</Text>
            <Button title="Fetch data await other action" onPress={fetchData} />
            <Button title="Fetch Data" onPress={fetchData2} />
            <Text>{useLoadingStatus()}</Text>
            {list?.map(item => (
                <Text key={item.id}>{item.name}</Text>
            ))}
        </View>
    );
};
