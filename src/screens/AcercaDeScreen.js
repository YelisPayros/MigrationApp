import React from 'react';
import { View, Text, Image, Button, Alert } from 'react-native';
import { deleteAll } from '../components/database/db';

export default function AcercaDeScreen() {
  const borrarTodo = () => {
    deleteAll(() => Alert.alert('Todos los registros han sido eliminados.'));
  };

  return (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Image source={require('../assets/images/agente.png')} style={{ width: 150, height: 150, borderRadius: 75 }} />
      <Text>Nombre: Juan Pérez</Text>
      <Text>Matrícula: 20241234</Text>
      <Text style={{ marginVertical: 20, fontStyle: 'italic' }}>
        "Proteger nuestras fronteras es servir a nuestra nación con dignidad y compromiso."
      </Text>
      <Button title="Borrar Todo" onPress={borrarTodo} color="red" />
    </View>
  );
}
