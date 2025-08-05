import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainMenuScreen from '../screens/MainMenuScreen';
import RegistroScreen from '../screens/RegistroScreen';
import ListadoScreen from '../screens/ListadoScreen';
import DetalleScreen from '../screens/DetalleScreen';
import AcercaDeScreen from '../screens/AcercaDeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen name="Menu" component={MainMenuScreen} options={{ title: 'Menú Principal' }} />
        <Stack.Screen name="Registro" component={RegistroScreen} />
        <Stack.Screen name="Listado" component={ListadoScreen} />
        <Stack.Screen name="Detalle" component={DetalleScreen} />
        <Stack.Screen name="AcercaDe" component={AcercaDeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
