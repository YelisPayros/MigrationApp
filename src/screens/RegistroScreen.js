import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { insertPersona, createTables } from '../components/database/db';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import LinearGradient from 'react-native-linear-gradient';

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
  const [reproduciendo, setReproduciendo] = useState(false);
  const [duracionAudio, setDuracionAudio] = useState('00:00');
  const [progresoAudio, setProgresoAudio] = useState(0);
  const [nivelAudio, setNivelAudio] = useState(0);
  const [coords, setCoords] = useState(null);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const holdTimer = useRef(null);

  const fecha = new Date().toLocaleString();

  useEffect(() => {
    createTables();
  }, []);

  useEffect(() => {
    if (grabando) {
      const interval = setInterval(() => {
        const randomLevel = Math.random() * 10;
        setNivelAudio(Math.floor(randomLevel));
      }, 200);
      return () => clearInterval(interval);
    } else {
      setNivelAudio(0);
      setDuracionAudio('00:00');
    }
  }, [grabando]);

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
    if (!permiso) return;
    const path = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.m4a`;

    try {
      await audioRecorderPlayer.startRecorder(path);
      audioRecorderPlayer.addRecordBackListener(e => {
        const min = Math.floor(e.currentPosition / 60000);
        const sec = Math.floor((e.currentPosition % 60000) / 1000);
        setDuracionAudio(`${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`);
      });
      setGrabando(true);
    } catch {
      setGrabando(false);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setGrabando(false);
      if (result) {
        const audioPath = result.replace('file://', '');
        RNFS.stat(audioPath)
          .then(info => {
            if (info.size > 0) {
              setAudio(audioPath);
            }
          })
          .catch(() => {});
      }
    } catch {
      setGrabando(false);
    }
  };

  const handleAudioPressIn = () => {
    holdTimer.current = setTimeout(() => {
      startRecording();
    }, 200);
  };

  const handleAudioPressOut = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (grabando) {
      stopRecording();
    }
  };

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
    if (!permiso) return;
    setCargandoUbicacion(true);
    Geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });

        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
              { headers: { 'User-Agent': 'MigrationApp' } }
            );
            const data = await response.json();
            const ciudad = data.address.city || data.address.town || data.address.village || 'Ciudad desconocida';
            const pais = data.address.country || 'País desconocido';
            setUbicacion(`${ciudad}, ${pais}`);
          } catch {
            setUbicacion('');
          }
        } else {
          setUbicacion('');
        }
        setCargandoUbicacion(false);
      },
      () => {
        setCoords(null);
        setUbicacion('');
        setCargandoUbicacion(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const reproducirAudio = async () => {
    if (!reproduciendo) {
      await audioRecorderPlayer.startPlayer(audio);
      audioRecorderPlayer.addPlayBackListener(e => {
        setProgresoAudio(e.currentPosition / e.duration);
        if (e.currentPosition >= e.duration) {
          setReproduciendo(false);
        }
      });
      setReproduciendo(true);
    } else {
      await audioRecorderPlayer.pausePlayer();
      setReproduciendo(false);
    }
  };

  const guardar = () => {
    if (!nombre || !edad || !descripcion) {
      Alert.alert('Faltan campos obligatorios', 'Nombre, edad y descripción son requeridos.');
      return;
    }
    const data = { nombre, edad, nacionalidad, fecha, ubicacion, descripcion, foto, audio, coords };
    insertPersona(data, () => {
      Alert.alert('Registro guardado exitosamente');
      setNombre('');
      setEdad('');
      setNacionalidad('');
      setDescripcion('');
      setFoto('');
      setAudio('');
      setUbicacion('');
      setCoords(null);
      setDuracionAudio('00:00');
      setNivelAudio(0);
    });
  };

  const renderVolumen = () => (
    <View style={styles.contenedorVolumen}>
      {Array.from({ length: 10 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.barraVolumen,
            {
              height: 10 + (i <= nivelAudio ? 15 * (nivelAudio / 10) : 5),
              backgroundColor: i <= nivelAudio ? '#D32F2F' : '#B0B0B0'
            }
          ]}
        />
      ))}
    </View>
  );

  return (
    <LinearGradient colors={['#888888', '#444444']} style={styles.gradientContainer}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30 }}>
        {/* SECCIÓN DATOS */}
        <View style={styles.section}>
          <Text style={styles.titulo}>Nombre:</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ingrese el nombre" placeholderTextColor="#aaa" />

          <Text style={styles.titulo}>Edad estimada:</Text>
          <TextInput style={styles.input} value={edad} onChangeText={setEdad} keyboardType="numeric" placeholderTextColor="#aaa" />

          <Text style={styles.titulo}>Nacionalidad (opcional):</Text>
          <TextInput style={styles.input} value={nacionalidad} onChangeText={setNacionalidad} placeholderTextColor="#aaa" />

          <Text style={styles.titulo}>Descripción del encuentro:</Text>
          <TextInput style={[styles.input, styles.descripcion]} value={descripcion} onChangeText={setDescripcion} multiline placeholderTextColor="#aaa" />
        </View>

        {/* SECCIÓN FOTO */}
        <View style={styles.section}>
          <View style={styles.botonContainer}>
            <TouchableOpacity style={styles.botonIcono} onPress={tomarFoto}>
              <View style={styles.iconoContenedor}><FontAwesome6 name="camera" size={20} color="#fff" /></View>
            </TouchableOpacity>
            <TouchableOpacity onPress={tomarFoto}>
              <Text style={styles.textoBoton}>Tomar Foto</Text>
            </TouchableOpacity>
          </View>
          {foto ? <Image source={{ uri: foto }} style={styles.foto} /> : null}
        </View>

        {/* SECCIÓN UBICACIÓN */}
        <View style={styles.section}>
          <Text style={styles.titulo}>Ubicación: {ubicacion || 'No obtenida'}</Text>
          <View style={styles.botonContainer}>
            <TouchableOpacity style={styles.botonIcono} onPress={obtenerUbicacion}>
              <View style={styles.iconoContenedor}><FontAwesome6 name="location-dot" size={20} color="#fff" /></View>
            </TouchableOpacity>
            <TouchableOpacity onPress={obtenerUbicacion}>
              <Text style={styles.textoBoton}>Obtener Mapa</Text>
            </TouchableOpacity>
          </View>
          {cargandoUbicacion ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C62828" />
            </View>
          ) : coords ? (
            <View style={styles.mapaContenedor}>
              <WebView originWhitelist={['*']} scrollEnabled={false} style={styles.mapa}
                source={{
                  html: `
                    <html><head>
                      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                      <style>html, body, #map { height: 100%; margin: 0; }</style>
                    </head>
                    <body>
                      <div id="map"></div>
                      <script>
                        var map = L.map('map').setView([${coords.latitude}, ${coords.longitude}], 15);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                        L.marker([${coords.latitude}, ${coords.longitude}]).addTo(map);
                      </script>
                    </body></html>` }}
              />
            </View>
          ) : null}
        </View>

        {/* SECCIÓN AUDIO */}
        <View style={styles.section}>
          <Text style={styles.titulo}>Audio: {audio ? 'Grabado' : 'Sin grabar'}</Text>
          <View style={styles.botonContainer}>
            <TouchableOpacity style={[styles.botonIcono, grabando && styles.botonGrabando]} onPressIn={handleAudioPressIn} onPressOut={handleAudioPressOut}>
              <View style={[styles.iconoContenedor, grabando && styles.iconoGrabando]}>
                <FontAwesome6 name="microphone" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.textoBoton}>Mantener para Grabar</Text>
          </View>
          {grabando && <View style={styles.audioInfo}>{renderVolumen()}<Text style={styles.duracionAudio}>{duracionAudio}</Text></View>}
          {audio && !grabando && (
            <View style={styles.audioPlayer}>
              <TouchableOpacity style={styles.botonIconoNegro} onPress={reproducirAudio}>
                <FontAwesome6 name={reproduciendo ? "pause" : "play"} size={20} color="#fff" />
              </TouchableOpacity>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progresoAudio * 100}%` }]} />
              </View>
            </View>
          )}
        </View>

        {/* BOTONES */}
        <TouchableOpacity style={styles.botonGuardar} onPress={guardar}>
          <Text style={styles.textoBotonGuardar}>Guardar Registro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.botonGuardar, styles.botonListado]} onPress={() => navigation.navigate('Listado')}>
          <Text style={styles.textoBotonGuardar}>Ver Listado</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1, padding: 15 },
  section: { padding: 15, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8 },
  titulo: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#222', marginBottom: 15 },
  descripcion: { height: 120, textAlignVertical: 'top' },
  foto: { width: 200, height: 200, marginTop: 15, alignSelf: 'center', borderRadius: 10 },
  botonContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  botonIcono: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#C62828', justifyContent: 'center', alignItems: 'center' },
  botonIconoNegro: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  iconoContenedor: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#B71C1C', justifyContent: 'center', alignItems: 'center' },
  iconoGrabando: { backgroundColor: '#D84315' },
  textoBoton: { color: '#fff', fontSize: 16, marginLeft: 12, fontWeight: '600' },
  mapaContenedor: { height: 180, width: '100%', marginTop: 15, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#C62828' },
  mapa: { flex: 1 },
  botonGuardar: { backgroundColor: '#B71C1C', marginTop: 25, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  textoBotonGuardar: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  botonListado: { backgroundColor: '#757575', marginTop: 15, marginBottom: 20 },
  botonGrabando: { backgroundColor: '#D84315' },
  audioInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'center' },
  duracionAudio: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 12 },
  contenedorVolumen: { flexDirection: 'row', alignItems: 'flex-end' },
  barraVolumen: { width: 6, marginHorizontal: 2, borderRadius: 3 },
  audioPlayer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'center' },
  progressBarContainer: { width: '40%', height: 4, backgroundColor: '#ccc', borderRadius: 3, marginLeft: 8, overflow: 'hidden' },
  progressBar: { height: 4, backgroundColor: '#000' },
  loadingContainer: { height: 180, width: '100%', marginTop: 15, justifyContent: 'center', alignItems: 'center' },
});