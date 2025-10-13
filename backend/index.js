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
    const result = await pool.query(`SELECT c.fecha AS "Fecha",
    a.nombre_asignatura AS "Nombre Asignatura",
    s.codigo_seccion AS "Sigla Sección",
    d.apellido_paterno || ' ' || d.apellido_materno || ' ' || d.nombres AS "NOMBRE",
    sa.id_sala AS "Sala",
    c.hora_inicio AS "Hora Inicio",
    c.hora_fin AS "Hora Fin",
    av.mensaje AS "Observacion" FROM Clase c
    JOIN Seccion s ON s.codigo_seccion = c.seccion_codigo_seccion
    JOIN Asignatura a ON a.sigla_asignatura = s.asignatura_sigla
    JOIN Docente d ON d.id_docente = c.id_docente
    JOIN Sala sa ON sa.id_sala = c.sala_id_sala
    LEFT JOIN AVISO av ON av.clase_id_clase = c.id_clase
    ORDER BY c.fecha, c.hora_inicio;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en la DB');
  }   
});
// Insertar datos desde Excel 

// POST /clases - Insertar datos desde Excel
// 📦 Insertar datos desde Excel
app.post('/clases', async (req, res) => {
  const datos = Array.isArray(req.body) ? req.body : [req.body];

  if (!Array.isArray(datos) || datos.length === 0) {
    return res.status(400).json({ error: 'No se recibieron datos' });
  }

  try {
    for (const [i, fila] of datos.entries()) {
      const fecha = fila.fecha || fila.Fecha;
      const jornada = fila.jornada || fila.Jornada;
      const siglaSeccion = fila['Sigla Sección'] || fila['Sigla Secci&oacute;n'] || '';
      const sigla = siglaSeccion.split('-')[0] || '';
      const nombreAsignatura = fila['Nombre Asignatura'] || fila.nombre_asignatura || '';
      const id_docente = fila['Id Docente'] || fila.id_docente || '';
      const rut_docente = fila['Rut Docente'] || fila.rut_docente || '';
      const apellido_paterno = fila['Apellido Paterno'] || fila.apellido_paterno || '';
      const apellido_materno = fila['Apellido Materno'] || fila.apellido_materno || '';
      const nombres = fila['Nombres'] || fila.nombres || '';
      const sala = fila['Sala'] || fila.sala || '';
      const tipo = fila['Tipo'] || fila.tipo || '';
      const modalidad = fila['Modalidad'] || fila.modalidad || '';
      const horario = fila['Horario'] || '';
      const [hora_inicio, hora_fin] = horario.split(/\s+/);

      // 🧱 Inserciones ordenadas según tus tablas:
      await pool.query(`
        INSERT INTO Jornada (jornada, nombre_jornada)
        VALUES (CAST($1 AS CHAR(1)),
        CASE WHEN CAST($1 AS CHAR(1))='D' THEN 'Diurno'
        WHEN CAST($1 AS CHAR(1))='V' THEN 'Vespertino'
        ELSE 'Otro' END)
        ON CONFLICT (jornada) DO NOTHING`, [jornada]);

      await pool.query(`
        INSERT INTO Asignatura (sigla_asignatura, nombre_asignatura)
        VALUES ($1, $2)
        ON CONFLICT (sigla_asignatura) DO NOTHING
      `, [sigla, nombreAsignatura]);

      await pool.query(`
        INSERT INTO Seccion (codigo_seccion, asignatura_sigla, jornada)
        VALUES ($1, $2, $3)
        ON CONFLICT (codigo_seccion) DO NOTHING
      `, [siglaSeccion, sigla, jornada]);

      await pool.query(`
        INSERT INTO Docente (id_docente, rut_docente, apellido_paterno, apellido_materno, nombres)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id_docente) DO NOTHING
      `, [id_docente, rut_docente, apellido_paterno, apellido_materno, nombres]);

      await pool.query(`
        INSERT INTO Sala (id_sala)
        VALUES ($1)
        ON CONFLICT (id_sala) DO NOTHING
      `, [sala]);

      await pool.query(`
        INSERT INTO Clase (fecha, hora_inicio, hora_fin, tipo, modalidad, id_docente, seccion_codigo_seccion, sala_id_sala)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [fecha, hora_inicio, hora_fin, tipo, modalidad, id_docente, siglaSeccion, sala]);

      console.log(`✅ Fila ${i + 1} insertada correctamente`);
    }

    res.status(200).json({ message: 'Todas las filas fueron insertadas correctamente.' });

  } catch (error) {
    console.error('❌ Error al insertar datos:', error);
    res.status(500).json({ error: 'Error al insertar los datos' });
  }
});
     
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
