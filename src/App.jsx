import { useState } from 'react';
import Agricultores from './components/Agricultores';
import Cultivos from './components/Cultivos';
import './App.css';

function App() {
  const [recargarCultivos, setRecargarCultivos] = useState(0);

  return (
    <div className="contenedor">
      <header className="encabezado">
        <h1>🌿 Huerta Comunitaria</h1>
        <p>Sistema de gestión de agricultores, semillas y cosechas</p>
      </header>

      <main className="grid-principal">
        <Agricultores onCambio={() => setRecargarCultivos((n) => n + 1)} />
        <Cultivos actualizarTrigger={recargarCultivos} />
      </main>

      <footer style={{ textAlign: 'center', marginTop: '2.5rem', color: '#555', fontSize: '0.9rem' }}>
        <p>Proyecto Huerta Comunitaria — Ingeniería de Software • 2026</p>
      </footer>
    </div>
  );
}

export default App;