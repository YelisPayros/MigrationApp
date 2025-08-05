// screens/MainMenuScreen.js
import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

export default function MainMenuScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menú Principal</Text>

      <Button
        title="📝 Registrar Persona Indocumentada"
        onPress={() => navigation.navigate('Registro')}
      />

      <View style={styles.space} />

      <Button
        title="📋 Ver Listado de Personas"
        onPress={() => navigation.navigate('Listado')}
      />

      <View style={styles.space} />

      <Button
        title="ℹ️ Acerca del Agente"
        onPress={() => navigation.navigate('AcercaDe')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center'
  },
  space: {
    height: 20
  }
});
