import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  Image,
  PermissionsAndroid,
  Platform
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { insertPersona, createTables } from '../components/database/db';

const audioRecorderPlayer = new AudioRecorderPlayer();

export default function RegistroScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [nacionalidad, setNacionalidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [audio, setAudio] = useState('');
  const [grabando, setGrabando] = useState(false);
  const fecha = new Date().toLocaleString();

  useEffect(() => {
    createTables();
  }, []);

  // 📷 Permiso y captura de foto
  const pedirPermisoCamara = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const tomarFoto = async () => {
    const permiso = await pedirPermisoCamara();
    if (!permiso) {
      Alert.alert('Permiso denegado para usar la cámara');
      return;
    }

    launchCamera({ mediaType: 'photo', saveToPhotos: true }, response => {
      if (response?.assets?.length > 0) {
        setFoto(response.assets[0].uri);
      }
    });
  };

  // 🎤 Permiso y grabación de audio
  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startRecording = async () => {
    const permiso = await requestAudioPermission();
    if (!permiso) return Alert.alert('Permiso denegado para grabar audio');

    const path = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.m4a`;

    try {
      await audioRecorderPlayer.startRecorder(path);
      setGrabando(true);
    } catch (error) {
      Alert.alert('Error al iniciar grabación', error.message);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setGrabando(false);

      if (result) {
        const audioPath = result.replace('file://', '');
        RNFS.stat(audioPath)
          .then(info => {
            if (info.size > 0) {
              setAudio(audioPath);
            } else {
              Alert.alert("Audio vacío", "No se grabó nada en el archivo");
            }
          })
          .catch(() => {
            Alert.alert("Error", "No se pudo encontrar el archivo de audio");
          });
      }
    } catch (error) {
      Alert.alert('Error al detener grabación', error.message);
    }
  };

  // 📍 Permiso y obtención de ubicación mejorada
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const obtenerUbicacion = async () => {
    const permiso = await requestLocationPermission();
    if (!permiso) return Alert.alert('Permiso denegado para obtener ubicación');

    let ubicacionObtenida = false;

    const watchId = Geolocation.watchPosition(
      pos => {
        if (!ubicacionObtenida) {
          ubicacionObtenida = true;
          const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
          setUbicacion(coords);
          Geolocation.clearWatch(watchId); // detener seguimiento
        }
      },
      error => {
        if (!ubicacionObtenida) {
          Alert.alert('Error al obtener ubicación', error.message);
        }
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        timeout: 15000,
        maximumAge: 5000
      }
    );

    // Cancelar si no se obtiene ubicación en 20s
    setTimeout(() => {
      if (!ubicacionObtenida) {
        Geolocation.clearWatch(watchId);
        Alert.alert('Tiempo de espera agotado', 'No se pudo obtener la ubicación');
      }
    }, 20000);
  };

  // 💾 Guardar registro
  const guardar = () => {
    if (!nombre || !edad || !descripcion) {
      Alert.alert('Faltan campos obligatorios', 'Nombre, edad y descripción son requeridos.');
      return;
    }

    const data = {
      nombre,
      edad,
      nacionalidad,
      fecha,
      ubicacion,
      descripcion,
      foto,
      audio
    };

    insertPersona(data, () => {
      Alert.alert('Registro guardado exitosamente');
      setNombre('');
      setEdad('');
      setNacionalidad('');
      setDescripcion('');
      setFoto('');
      setAudio('');
      setUbicacion('');
    });
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text>🧾 Nombre:</Text>
      <TextInput value={nombre} onChangeText={setNombre} placeholder="Ingrese el nombre" />

      <Text>🎂 Edad estimada:</Text>
      <TextInput value={edad} onChangeText={setEdad} keyboardType="numeric" />

      <Text>🌎 Nacionalidad (opcional):</Text>
      <TextInput value={nacionalidad} onChangeText={setNacionalidad} />

      <Text>📝 Descripción del encuentro:</Text>
      <TextInput
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      {foto ? <Image source={{ uri: foto }} style={{ width: 200, height: 200 }} /> : null}
      <Button title="📷 Tomar Foto" onPress={tomarFoto} />

      <Text style={{ marginTop: 10 }}>📍 Ubicación: {ubicacion}</Text>
      <Button title="Obtener Ubicación GPS" onPress={obtenerUbicacion} />

      <Text style={{ marginTop: 10 }}>🎤 Audio: {audio ? 'Grabado' : 'Sin grabar'}</Text>
      <Button
        title={grabando ? 'Detener Grabación' : 'Grabar Audio'}
        onPress={grabando ? stopRecording : startRecording}
      />

      <Button title="Guardar Registro" onPress={guardar} color="#4CAF50" />
      <Button title="📋 Ver Listado" onPress={() => navigation.navigate('Listado')} />
    </ScrollView>
  );
}
