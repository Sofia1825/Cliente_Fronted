import { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/agricultores/';

export default function Agricultores({ onCambio }) {
  const [agricultores, setAgricultores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sector, setSector] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarAgricultores = async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al conectar con el servidor');
      const data = await res.json();
      setAgricultores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAgricultores();
  }, []);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    const datos = { nombre, telefono, sector };
    const url = editandoId ? `${API_URL}${editandoId}/` : API_URL;
    const metodo = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error('No se pudo guardar el agricultor');

      setNombre('');
      setTelefono('');
      setSector('');
      setEditandoId(null);
      await cargarAgricultores();
      if (onCambio) onCambio();
    } catch (err) {
      setError(err.message);
    }
  };

  const prepararEdicion = (ag) => {
    setEditandoId(ag.id);
    setNombre(ag.nombre);
    setTelefono(ag.telefono);
    setSector(ag.sector);
  };

  const eliminarAgricultor = async (id) => {
    try {
      const res = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');
      await cargarAgricultores();
      if (onCambio) onCambio();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="tarjeta">
      <h2>👩‍🌾 Gestión de Agricultores</h2>

      <form onSubmit={manejarSubmit} className="formulario">
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Sector / Parcela"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          required
        />
        <button type="submit">
          {editandoId ? 'Actualizar Agricultor' : 'Agregar Agricultor'}
        </button>
        {editandoId && (
          <button
            type="button"
            className="btn-secundario"
            onClick={() => {
              setEditandoId(null);
              setNombre('');
              setTelefono('');
              setSector('');
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {cargando && <p>Cargando agricultores...</p>}
      {error && <p className="error">⚠️ {error}</p>}

      {!cargando && !error && (
        <ul className="lista">
          {agricultores.length === 0 ? (
            <p>No hay agricultores registrados todavía.</p>
          ) : (
            agricultores.map((ag) => (
              <li key={ag.id} className="item">
                <div>
                  <strong>{ag.nombre}</strong> — {ag.sector} <br />
                  <small>📞 {ag.telefono}</small>
                </div>
                <div className="acciones">
                  <button onClick={() => prepararEdicion(ag)}>✏️</button>
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarAgricultor(ag.id)}
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