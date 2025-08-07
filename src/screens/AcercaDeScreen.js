import React from 'react';
import { View, Text, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { deleteAll } from '../components/database/db';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

export default function AcercaDeScreen() {
  const borrarTodo = () => {
    Alert.alert(
      'Confirmar',
      '¿Seguro que deseas eliminar toda la información?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteAll(() => Alert.alert('Toda la información ha sido eliminada.'));
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#7d7d7dff', '#444444']} style={styles.gradientContainer}>
      <View style={styles.card}>
        <Text style={styles.titulo}>Agente</Text>

        {/* Encabezado con foto y datos */}
        <View style={styles.encabezado}>
          <View style={styles.info}>
            <Text style={styles.nombre}>Yelis</Text>
            <Text style={styles.apellido}>Payero</Text>
            <Text style={styles.matricula}>Matrícula: 20230930</Text>
          </View>
          <Image source={require('../assets/images/agente.png')} style={styles.foto} />
        </View>

        {/* Frase */}
        <Text style={styles.frase}>
          "Proteger nuestras fronteras es servir a nuestra nación con dignidad y compromiso."
        </Text>

        {/* Botón limpiar */}
        <TouchableOpacity style={styles.botonBorrar} onPress={borrarTodo}>
          <FontAwesome6 name="trash" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.textoBorrar}>Limpiar toda la información</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1, padding: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 22
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 28
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28
  },
  info: {
    flex: 1,
    paddingRight: 15
  },
  nombre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  apellido: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10
  },
  matricula: {
    fontSize: 17,
    color: '#ddd'
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60
  },
  frase: {
    fontStyle: 'italic',
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22
  },
  botonBorrar: {
    flexDirection: 'row',
    backgroundColor: '#B71C1C',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textoBorrar: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold'
  }
});
