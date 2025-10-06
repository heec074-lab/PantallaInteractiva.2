const express = require('express');
const cors = require('cors');
const pool = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend funcionando');
});

app.get('/clases', async (req, res) => {
  try {
    const result = await pool.query(`SELECT
      c.fecha AS "Fecha",
      a.nombre_asignatura AS "Nombre Asignatura",
      a.sigla || '-' || s.nombre_seccion AS "Sigla Sección",
      d.apellido_paterno || ' ' || d.apellido_materno || ' ' || d.nombres AS "NOMBRE",
      sa.sala AS "Sala",
      c.horario AS "Horario",
      av.mensaje AS "Observacion"
      FROM Clase c
      JOIN Seccion s ON s.id_seccion = c.seccion_id_seccion
      JOIN Asignatura a ON a.id_asignatura = s.asignatura_id_asignatura
      JOIN Docente d ON d.id_docente = c.docente_id_docente
      JOIN Sala sa ON sa.id_sala = c.sala_id_sala
      LEFT JOIN avisos av ON av.clase_id_clase = c.id_clase
      ORDER BY c.fecha, c.horario;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en la DB');
  }   
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
