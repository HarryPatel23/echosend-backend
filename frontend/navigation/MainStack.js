import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import CreateScheduleScreen from '../screens/CreateScheduleScreen';

const Stack = createNativeStackNavigator();

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'My Schedules' }} />
    <Stack.Screen name="CreateSchedule" component={CreateScheduleScreen} options={{ title: 'New Schedule' }} />
  </Stack.Navigator>
);

export default MainStack;
