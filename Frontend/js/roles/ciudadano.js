document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('token')) {
    alert('Por favor, inicia sesión primero.');
    window.location.href = '/html/Usuarios/login.html';
  } else {
    obtenerPropuestas(); // Llamar a la función solo si el usuario está autenticado
  }
});
const localidadesNombres = {
  "4.58917,-74.12817": "Antonio Nariño",
  "4.66558,-74.07787": "Barrios Unidos",
  "4.62881,-74.18548": "Bosa",
  "4.65451,-74.05894": "Chapinero",
  "4.54297,-74.15403": "Ciudad Bolívar",
  "4.6838,-74.111": "Engativá",
  "4.67833,-74.13978": "Fontibón",
  "4.6261,-74.14889": "Kennedy",
  "4.59575,-74.07458": "La Candelaria",
  "4.61607,-74.08665": "Los Mártires",
  "4.62788,-74.10395": "Puente Aranda",
  "4.56589,-74.10793": "Rafael Uribe Uribe",
  "4.56309,-74.0908": "San Cristóbal",
  "4.60622,-74.07039": "Santa Fe",
  "4.75591,-74.09016": "Suba",
  "4.1461,-74.26986": "Sumapaz",
  "4.64263,-74.09339": "Teusaquillo",
  "4.58249,-74.12377": "Tunjuelito",
  "4.71491,-74.03291": "Usaquén",
  "4.50482,-74.10858": "Usme"
};
function formatearFechaParaColombia(fechaISO) {
  const fecha = new Date(fechaISO);
  // Ajustar la fecha para la zona horaria de Bogotá, si es necesario
  const opciones = { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' };
  return fecha.toLocaleDateString('es-CO', opciones);
}

async function cargarPropuestas(filtroLocalidad = '') {
  try {
    const response = await fetch('/ciudadano/propuestas');
    const propuestas = await response.json();

    const propuestasContainer = document.getElementById('propuestasContainer');
    propuestasContainer.innerHTML = '';

    const propuestasFiltradas = filtroLocalidad
      ? propuestas.filter(propuesta => {
          const localidadNombre = localidadesNombres[propuesta.localidad] || propuesta.localidad;
          return localidadNombre.toLowerCase() === filtroLocalidad.toLowerCase();
        })
      : propuestas;

    if (propuestasFiltradas.length === 0) {
      propuestasContainer.innerHTML = '<p>No hay propuestas para esta localidad.</p>';
      return;
    }

    const propuestasPorLocalidad = {};
    propuestasFiltradas.forEach(propuesta => {
      const localidadNombre = localidadesNombres[propuesta.localidad] || propuesta.localidad;
      if (!propuestasPorLocalidad[localidadNombre]) {
        propuestasPorLocalidad[localidadNombre] = [];
      }
      propuestasPorLocalidad[localidadNombre].push(propuesta);
    });

    for (const [localidad, propuestas] of Object.entries(propuestasPorLocalidad)) {
      const localidadTitle = document.createElement('h2');
      localidadTitle.className = 'localidad-title';
      localidadTitle.textContent = `Localidad: ${localidad}`;
      propuestasContainer.appendChild(localidadTitle);

      const row = document.createElement('div');
      row.className = 'row';

      propuestas.forEach(propuesta => {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4';

        const card = document.createElement('div');
        card.className = 'card';

        const coords = propuesta.ubicacion.split(',').map(coord => parseFloat(coord.trim()));

        card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${propuesta.titulo}</h5>
            <button class="btn btn-primary" onclick="verDetalle(${propuesta.id})">Ver Detalle</button>
        </div>
        <div class="map-container" id="map-${propuesta.id}"></div>
      `;
        col.appendChild(card);
        row.appendChild(col);

        setTimeout(() => crearMapa(`map-${propuesta.id}`, coords), 0);
      });

      propuestasContainer.appendChild(row);
    }
  } catch (error) {
    console.error('Error al cargar propuestas:', error);
  }
}
function verDetalle(id) {
  window.location.href = `detalle.html?id=${id}`;
}

function abrirEnGoogleMaps(lat, lng) {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  window.open(url, '_blank');
}


function crearMapa(mapId, coords) {
  const map = L.map(mapId).setView(coords, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  L.marker(coords).addTo(map);
}

function filtrarPropuestas() {
  const localidadSeleccionada = document.getElementById('localidadSelect').value;
  cargarPropuestas(localidadSeleccionada);
}
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  // Decodificar el token (en producción, usa una librería como jwt-decode)
  function decodeToken(token) {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      return null;
    }
  }

  const userData = decodeToken(token);

  if (userData) {
    // Mostrar el nombre del usuario
    document.getElementById('userName').textContent = userData.identificacion || 'Usuario';
  } else {
    // Redirigir al login si no hay un token válido
    alert('Por favor, inicia sesión primero.');
    window.location.href = '/html/Usuarios/login.html';
  }

  // Lógica para cerrar sesión
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token'); // Elimina el token
    alert('Has cerrado sesión.');
    window.location.href = '/html/Usuarios/login.html'; // Redirige al login
  });
});


document.addEventListener('DOMContentLoaded', cargarPropuestas);
