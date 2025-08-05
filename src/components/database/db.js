import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'migracion.db', location: 'default' },
  () => console.log('BD abierta correctamente'),
  err => console.log('Error abriendo BD:', err)
);

export const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS personas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        edad TEXT,
        nacionalidad TEXT,
        fecha TEXT,
        ubicacion TEXT,
        descripcion TEXT,
        foto TEXT,
        audio TEXT
      );`,
      [],
      () => console.log('Tabla creada o ya existía'),
      (txObj, error) => console.error('Error creando tabla:', error)
    );
  });
};

export const insertPersona = (data, success) => {
  let { nombre, edad, nacionalidad, fecha, ubicacion, descripcion, foto, audio } = data;

  // Limpia la ruta del audio si empieza con file://
  if (audio && audio.startsWith('file://')) {
    audio = audio.replace('file://', '');
  }

  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO personas (nombre, edad, nacionalidad, fecha, ubicacion, descripcion, foto, audio) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [nombre, edad, nacionalidad, fecha, ubicacion, descripcion, foto, audio],
      (_, result) => {
        console.log('Registro insertado con id:', result.insertId);
        success(result);
      },
      (_, error) => {
        console.error('Error insertando registro:', error);
        return false;
      }
    );
  });
};

export const getPersonas = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM personas;`,
      [],
      (_, result) => {
        let dataArray = [];
        if (result?.rows?._array) {
          dataArray = result.rows._array;
        } else if (result?.rows?.length) {
          for (let i = 0; i < result.rows.length; i++) {
            dataArray.push(result.rows.item(i));
          }
        }
        console.log('Personas obtenidas:', dataArray);
        callback(dataArray);
      },
      (_, error) => {
        console.error('Error obteniendo personas:', error);
        callback([]);
      }
    );
  });
};

export const getPersonaById = (id, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM personas WHERE id = ?;`,
      [id],
      (_, result) => {
        if (result?.rows?.length > 0) {
          callback(result.rows.item(0));
        } else {
          callback(null);
        }
      },
      (_, error) => {
        console.error('Error obteniendo persona por id:', error);
        callback(null);
      }
    );
  });
};

export const deleteAll = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `DELETE FROM personas;`,
      [],
      (_, result) => callback(result),
      (_, error) => {
        console.error('Error borrando registros:', error);
      }
    );
  });
};
