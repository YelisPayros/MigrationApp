import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import LinearGradient from 'react-native-linear-gradient';

export default function MainMenuScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Imagen superior con degradado */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/img.jpg')}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.gradientOverlay}
        />
      </View>

      {/* Opciones de menú */}
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Registro')}>
        <FontAwesome6 name="pen" size={18} color="#fff" style={styles.icon} />
        <Text style={styles.menuText}>Registrar Persona Indocumentada</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Listado')}>
        <FontAwesome6 name="list" size={18} color="#fff" style={styles.icon} />
        <Text style={styles.menuText}>Ver Listado de Personas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('AcercaDe')}>
        <FontAwesome6 name="user" size={18} color="#fff" style={styles.icon} />
        <Text style={styles.menuText}>Acerca del Agente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20
  },
  imageContainer: {
    height: '48%',
    width: '100%',
    marginBottom: 30,
    overflow: 'hidden',
    borderRadius: 6
  },
  image: {
    width: '100%',
    height: '100%'
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#555',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 24
  },
  icon: {
    marginRight: 10
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});