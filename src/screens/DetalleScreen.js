import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getPersonaById } from '../components/database/db';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const audioPlayer = new AudioRecorderPlayer();

export default function DetalleScreen({ route }) {
  const { id } = route.params;
  const [persona, setPersona] = useState(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progresoAudio, setProgresoAudio] = useState(0);

  useEffect(() => {
    getPersonaById(id, setPersona);
  }, [id]);

  const reproducirAudio = async () => {
    if (!persona?.audio) {
      Alert.alert('No hay audio para reproducir');
      return;
    }

    try {
      const existe = await RNFS.exists(persona.audio);
      if (!existe) {
        Alert.alert("Error", "El archivo de audio no existe");
        return;
      }

      if (reproduciendo) {
        await audioPlayer.stopPlayer();
        audioPlayer.removePlayBackListener();
        setReproduciendo(false);
        return;
      }

      await audioPlayer.startPlayer(persona.audio);
      audioPlayer.setVolume(1.0);
      setReproduciendo(true);

      audioPlayer.addPlayBackListener((e) => {
        setProgresoAudio(e.currentPosition / e.duration);
        if (e.currentPosition >= e.duration) {
          audioPlayer.stopPlayer();
          audioPlayer.removePlayBackListener();
          setReproduciendo(false);
          setProgresoAudio(0);
        }
      });
    } catch (error) {
      Alert.alert('Error al reproducir audio', error.message);
    }
  };

  if (!persona) return <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>Cargando...</Text>;

  return (
    <LinearGradient colors={['#7d7d7dff', '#444444']} style={styles.gradientContainer}>
      <View style={styles.card}>
        <Text style={styles.titulo}>{persona.nombre}</Text>

        <Text style={styles.subTexto}><Text style={styles.label}>Edad:</Text> <Text style={styles.valor}>{persona.edad}</Text></Text>
        <Text style={styles.subTexto}><Text style={styles.label}>Nacionalidad:</Text> <Text style={styles.valor}>{persona.nacionalidad || 'No especificada'}</Text></Text>
        <Text style={styles.subTexto}><Text style={styles.label}>Fecha:</Text> <Text style={styles.fecha}>{persona.fecha}</Text></Text>
        <Text style={styles.subTexto}><Text style={styles.label}>Ubicación:</Text> <Text style={styles.valor}>{persona.ubicacion || 'No registrada'}</Text></Text>

        <Text style={[styles.subTexto, { marginTop: 12 }]}><Text style={styles.label}>Descripción:</Text></Text>
        <Text style={styles.descripcion}>{persona.descripcion}</Text>

        {persona.foto ? (
          <Image source={{ uri: persona.foto }} style={styles.foto} resizeMode="cover" />
        ) : null}

        {persona.audio ? (
          <View style={styles.audioPlayer}>
            <TouchableOpacity style={styles.botonAudio} onPress={reproducirAudio}>
              <FontAwesome6 name={reproduciendo ? "pause" : "play"} size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progresoAudio * 100}%` }]} />
            </View>
          </View>
        ) : (
          <Text style={styles.sinAudio}>No hay audio registrado</Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1, padding: 15 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.29)',
    borderRadius: 8,
    padding: 18
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20, // Más espacio con el resto de datos
    textAlign: 'center'
  },
  label: {
    fontWeight: 'bold', // Negrita para los encabezados
    color: '#fff'
  },
  subTexto: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 12 // Más separación entre líneas
  },
  valor: {
    color: '#464444a0',
    fontWeight: '600'
  },
  fecha: {
    color: '#3a4e3aff',
    fontWeight: '500',
    fontSize: 16
  },
  descripcion: {
    color: '#fff',
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 6,
    fontSize: 17,
    lineHeight: 22
  },
  foto: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 8
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'center'
  },
  botonAudio: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#B71C1C', // Rojo
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressBarContainer: {
    width: '50%',
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginLeft: 10,
    overflow: 'hidden'
  },
  progressBar: {
    height: 5,
    backgroundColor: '#B71C1C' // Rojo
  },
  sinAudio: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16
  }
});
