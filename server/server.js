const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Configuración de middleware
app.use(express.static('public'));  // Sirve archivos estáticos desde /public
app.use(bodyParser.json());  // Parsear cuerpo de las peticiones en JSON

// Conectar a la base de datos SQLite
const db = new sqlite3.Database('./miBaseDeDatos.db', (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Crear una tabla si no existe
db.run('CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, email TEXT)', (err) => {
  if (err) {
    console.log('Error creando la tabla:', err.message);
  }
});

// Ruta para insertar datos en la base de datos
app.post('/api/usuarios', (req, res) => {
  const { nombre, email } = req.body;
  const query = 'INSERT INTO usuarios (nombre, email) VALUES (?, ?)';

  db.run(query, [nombre, email], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ id: this.lastID, nombre, email });
  });
});

// Ruta para obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
  const query = 'SELECT * FROM usuarios';
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
