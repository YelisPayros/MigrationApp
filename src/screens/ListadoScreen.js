import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Button, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPersonas, deleteAll } from '../components/database/db';

export default function ListadoScreen({ navigation }) {
  const [personas, setPersonas] = useState([]);

  const cargarDatos = () => {
    getPersonas(data => {
      setPersonas(data || []);
    });
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const borrarTodo = () => {
    Alert.alert('Confirmar', '¿Eliminar todos los registros?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteAll(() => {
            Alert.alert('Todos los registros han sido eliminados');
            cargarDatos();
          });
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <Button title="🗑️ Borrar Todos" onPress={borrarTodo} color="red" />

      <FlatList
        data={personas}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Detalle', { id: item.id })}
            style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.nombre || 'Sin nombre'}</Text>
            <Text>{item.fecha || 'Sin fecha'}</Text>
            {item.foto ? (
              <Image
                source={{ uri: item.foto }}
                style={{ width: 100, height: 100, marginTop: 5 }}
                resizeMode="cover"
              />
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ padding: 20, textAlign: 'center' }}>No hay registros</Text>}
      />
    </View>
  );
}
