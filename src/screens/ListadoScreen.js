import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPersonas, deleteAll } from '../components/database/db';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'; // Importar icono

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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.nombre} numberOfLines={0}>
          {item.nombre || 'Sin nombre'}
        </Text>
        <Text style={styles.fecha}>{item.fecha || ''}</Text>
      </View>
      {item.foto ? (
        <Image
          source={{ uri: item.foto }}
          style={styles.foto}
          resizeMode="cover"
        />
      ) : null}
      <TouchableOpacity
        style={styles.botonDetalles}
        onPress={() => navigation.navigate('Detalle', { id: item.id })}
      >
        <Text style={styles.textoBoton}>Ver Detalles</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#7d7d7dff', '#444444']} style={styles.gradientContainer}>

      {/* Botón de borrar con icono */}
      <TouchableOpacity style={styles.botonBorrar} onPress={borrarTodo}>
        <FontAwesome6 name="trash" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.textoBorrar}>Borrar Todos</Text>
      </TouchableOpacity>

      <FlatList
        data={personas}
        keyExtractor={item => item.id?.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.sinRegistros}>No hay registros</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1, padding: 15 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  nombre: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
    flexWrap: 'wrap'
  },
  fecha: {
    fontSize: 14,
    color: '#354835ff',
    fontWeight: '600',
    textAlign: 'right'
  },
  foto: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10
  },
  botonDetalles: {
    backgroundColor: '#B71C1C',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold'
  },
  botonBorrar: {
    flexDirection: 'row', // Icono + texto
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B71C1C',
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 15
  },
  textoBorrar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  sinRegistros: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20
  }
});
