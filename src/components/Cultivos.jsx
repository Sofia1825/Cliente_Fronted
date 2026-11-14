import { useState, useEffect } from 'react';

const API_CULTIVOS = 'http://127.0.0.1:8000/api/cultivos/';
const API_AGRICULTORES = 'http://127.0.0.1:8000/api/agricultores/';

export default function Cultivos({ actualizarTrigger }) {
  const [cultivos, setCultivos] = useState([]);
  const [agricultores, setAgricultores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Semilla');
  const [cantidad, setCantidad] = useState('');
  const [agricultorId, setAgricultorId] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      const [resCultivos, resAgricultores] = await Promise.all([
        fetch(API_CULTIVOS),
        fetch(API_AGRICULTORES),
      ]);
      if (!resCultivos.ok || !resAgricultores.ok) {
        throw new Error('Error al cargar los datos de la huerta');
      }
      const dataCultivos = await resCultivos.json();
      const dataAgricultores = await resAgricultores.json();
      setCultivos(dataCultivos);
      setAgricultores(dataAgricultores);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [actualizarTrigger]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    const datos = {
      nombre,
      tipo,
      cantidad,
      agricultor: Number(agricultorId),
    };
    const url = editandoId ? `${API_CULTIVOS}${editandoId}/` : API_CULTIVOS;
    const metodo = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error('No se pudo guardar el cultivo');

      setNombre('');
      setTipo('Semilla');
      setCantidad('');
      setAgricultorId('');
      setEditandoId(null);
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const prepararEdicion = (cult) => {
    setEditandoId(cult.id);
    setNombre(cult.nombre);
    setTipo(cult.tipo);
    setCantidad(cult.cantidad);
    setAgricultorId(cult.agricultor);
  };

  const eliminarCultivo = async (id) => {
    try {
      const res = await fetch(`${API_CULTIVOS}${id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar el cultivo');
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const obtenerNombreAgricultor = (id) => {
    const encontrado = agricultores.find((a) => a.id === id);
    return encontrado ? encontrado.nombre : `ID #${id}`;
  };

  return (
    <section className="tarjeta">
      <h2>🌱 Inventario de Cultivos</h2>

      <form onSubmit={manejarSubmit} className="formulario">
        <input
          type="text"
          placeholder="Producto (ej: Cilantro, Papa)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="Semilla">Semilla</option>
          <option value="Cosecha">Cosecha</option>
        </select>
        <input
          type="text"
          placeholder="Cantidad (ej: 5 kilos, 10 sobres)"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />
        <select
          value={agricultorId}
          onChange={(e) => setAgricultorId(e.target.value)}
          required
        >
          <option value="">-- Selecciona un Agricultor --</option>
          {agricultores.map((ag) => (
            <option key={ag.id} value={ag.id}>
              {ag.nombre} ({ag.sector})
            </option>
          ))}
        </select>
        <button type="submit">
          {editandoId ? 'Actualizar Cultivo' : 'Registrar Cultivo'}
        </button>
        {editandoId && (
          <button
            type="button"
            className="btn-secundario"
            onClick={() => {
              setEditandoId(null);
              setNombre('');
              setTipo('Semilla');
              setCantidad('');
              setAgricultorId('');
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {cargando && <p>Cargando cultivos...</p>}
      {error && <p className="error">⚠️ {error}</p>}

      {!cargando && !error && (
        <ul className="lista">
          {cultivos.length === 0 ? (
            <p>No hay cultivos registrados todavía.</p>
          ) : (
            cultivos.map((cult) => (
              <li key={cult.id} className="item">
                <div>
                  <strong>{cult.nombre}</strong> ({cult.tipo}) — {cult.cantidad} <br />
                  <small>👨‍🌾 Responsable: {obtenerNombreAgricultor(cult.agricultor)}</small>
                </div>
                <div className="acciones">
                  <button onClick={() => prepararEdicion(cult)}>✏️</button>
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarCultivo(cult.id)}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}