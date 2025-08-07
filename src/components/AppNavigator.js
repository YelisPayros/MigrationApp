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
        <Stack.Screen 
          name="Menu" 
          component={MainMenuScreen} 
          options={{ 
            title: 'Menú Principal',
            headerStyle: { backgroundColor: '#495749ff' },
            headerTitleStyle: { color: '#fff' }
          }} 
        />
  <Stack.Screen 
          name="Registro" 
          component={RegistroScreen} 
          options={{ title: 'Registrar Persona' }} 
        />
        <Stack.Screen 
          name="Listado" 
          component={ListadoScreen} 
          options={{ title: 'Listado de Personas' }} 
        />
        <Stack.Screen 
          name="Detalle" 
          component={DetalleScreen} 
          options={{ title: 'Detalles de Persona' }} 
        />
        <Stack.Screen 
          name="AcercaDe" 
          component={AcercaDeScreen} 
          options={{ title: 'Acerca del Agente' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}