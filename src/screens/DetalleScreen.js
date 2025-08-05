import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, Alert } from 'react-native';
import { getPersonaById } from '../components/database/db';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioPlayer = new AudioRecorderPlayer();

export default function DetalleScreen({ route }) {
  const { id } = route.params;
  const [persona, setPersona] = useState(null);
  const [reproduciendo, setReproduciendo] = useState(false);

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
        if (e.current_position >= e.duration) {
          audioPlayer.stopPlayer();
          audioPlayer.removePlayBackListener();
          setReproduciendo(false);
        }
      });
    } catch (error) {
      Alert.alert('Error al reproducir audio', error.message);
    }
  };

  if (!persona) return <Text>Cargando...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text>Nombre: {persona.nombre}</Text>
      <Text>Edad: {persona.edad}</Text>
      <Text>Nacionalidad: {persona.nacionalidad}</Text>
      <Text>Fecha: {persona.fecha}</Text>
      <Text>Ubicación: {persona.ubicacion}</Text>
      <Text>Descripción: {persona.descripcion}</Text>

      {persona.foto ? (
        <Image source={{ uri: persona.foto }} style={{ width: 200, height: 200, marginVertical: 10 }} />
      ) : null}

      {persona.audio ? (
        <Button
          title={reproduciendo ? 'Detener Audio' : 'Reproducir Audio'}
          onPress={reproducirAudio}
        />
      ) : null}
    </View>
  );
}
