const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de middleware
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json());
app.use(express.static('public'));

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Función para crear la tabla si no existe
async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        edad INTEGER,
        telefono TEXT,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla de usuarios creada o ya existente');
  } catch (err) {
    console.error('Error al crear la tabla:', err);
  }
}

// Llamar a createTable al iniciar
createTable();

// Ruta para insertar datos en la base de datos
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nombre, email, edad, telefono } = req.body;
    const query = 'INSERT INTO usuarios (nombre, email, edad, telefono) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [nombre, email, edad, telefono];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al insertar usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario', details: err.message });
  }
});

// Ruta para obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const query = 'SELECT * FROM usuarios ORDER BY fecha_registro DESC LIMIT 10';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios', details: err.message });
  }
});

// Ruta para actualizar un usuario
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, edad, telefono } = req.body;
    
    const query = `
      UPDATE usuarios 
      SET nombre = $1, email = $2, edad = $3, telefono = $4 
      WHERE id = $5 
      RETURNING *
    `;
    const values = [nombre, email, edad, telefono, id];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario', details: err.message });
  }
});

// Ruta para eliminar un usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING *';
    const values = [id];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ 
      message: 'Usuario eliminado exitosamente', 
      usuario: result.rows[0] 
    });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario', details: err.message });
  }
});


// Solo para desarrollo local
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}