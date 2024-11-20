// Verificar si el usuario ha iniciado sesión antes de cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        alert('Por favor, inicia sesión primero.');
        window.location.href = '/html/Usuarios/login.html';
    } else {
        obtenerPropuestas(); // Llamar a la función solo si el usuario está autenticado
    }
});

// Mapa interactivo para selección de ubicación
let marker;
const map = L.map('map').setView([4.60971, -74.08175], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Capturar ubicación GPS y centrar el mapa en ella
document.getElementById('btnCapturarGPS').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                document.getElementById('ubicacionGPS').value = `${lat}, ${lng}`;
                map.setView([lat, lng], 14);

                if (marker) {
                    map.removeLayer(marker);
                }
                marker = L.marker([lat, lng], { draggable: true }).addTo(map);

                marker.on('moveend', (e) => {
                    const position = e.target.getLatLng();
                    document.getElementById('ubicacionManual').value = `${position.lat}, ${position.lng}`;
                });
            },
            (error) => {
               
            }
        );
    } else {
        alert('La geolocalización no es compatible con este navegador.');
    }
});

// Función para obtener y mostrar propuestas
async function obtenerPropuestas() {
    try {
        const response = await fetch('/planeador/propuestas');
        const propuestas = await response.json();
        const lista = document.getElementById('propuestasList');
        lista.innerHTML = '';
        propuestas.forEach((propuesta) => {
            const item = document.createElement('li');
            item.classList.add('list-group-item');
            item.innerHTML = `
                <strong>${propuesta.titulo}</strong> - ${propuesta.descripcion}
                <div class="propuesta-actions">
                    <button onclick="editarPropuesta(${propuesta.id})" class="btn btn-sm btn-warning">Editar</button>
                    <button onclick="eliminarPropuesta(${propuesta.id})" class="btn btn-sm btn-danger">Eliminar</button>
                </div>
            `;
            lista.appendChild(item);
        });
    } catch (error) {
        console.error('Error al obtener propuestas:', error);
    }
}

// Actualiza la función de guardar propuesta para incluir ambos campos de ubicación
// Configurar la fecha de inicio y fin en el formulario al editar una propuesta
async function editarPropuesta(id) {
    try {
        const response = await fetch(`/planeador/propuestas/${id}`);
        const propuesta = await response.json();

        document.getElementById('propuestaId').value = propuesta.id;
        document.getElementById('titulo').value = propuesta.titulo;
        document.getElementById('descripcion').value = propuesta.descripcion;
        document.getElementById('localidad').value = propuesta.localidad;
        document.getElementById('presupuesto').value = propuesta.presupuesto;

        // Convertir fechas a formato de Colombia (UTC-5)
        const fechaInicio = new Date(propuesta.fechaInicio);
        const fechaFin = new Date(propuesta.fechaFin);

        document.getElementById('fechaInicio').value = fechaInicio.toISOString().split('T')[0];
        document.getElementById('fechaFin').value = fechaFin.toISOString().split('T')[0];

        document.getElementById('ubicacionGPS').value = propuesta.ubicacionGPS;

        document.getElementById('submitButton').textContent = 'Actualizar Propuesta';
        document.getElementById('formTitle').textContent = 'Editar Propuesta de Proyecto';
    } catch (error) {
        console.error('Error al cargar propuesta:', error);
    }
}

// Formatear fechas al guardar la propuesta
async function guardarPropuesta(event) {
    event.preventDefault();

    const id = document.getElementById('propuestaId').value;
    const url = id ? `/planeador/actualizar-propuesta/${id}` : '/planeador/agregar-propuesta';
    const method = id ? 'PUT' : 'POST';

    // Crear objetos de fecha y ajustar al inicio del día en UTC-5
    const fechaInicio = new Date(document.getElementById('fechaInicio').value);
    fechaInicio.setUTCHours(5); // Ajuste a UTC-5

    const fechaFin = new Date(document.getElementById('fechaFin').value);
    fechaFin.setUTCHours(5); // Ajuste a UTC-5

    const data = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        localidad: document.getElementById('localidad').value,
        presupuesto: document.getElementById('presupuesto').value,
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0],
        ubicacionGPS: document.getElementById('ubicacionGPS').value,
    };

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }

        const result = await response.json();
        alert(result.message);
        obtenerPropuestas();
        document.getElementById('propuestaForm').reset();
        document.getElementById('propuestaId').value = '';
    } catch (error) {
        console.error('Error al guardar la propuesta:', error);
        alert('Ocurrió un error al guardar la propuesta: ' + error.message);
    }
}



// Función para eliminar una propuesta
async function eliminarPropuesta(id) {
    if (!confirm('¿Estás seguro de eliminar esta propuesta?')) return;
    try {
        const response = await fetch(`/planeador/eliminar-propuesta/${id}`, { method: 'DELETE' });
        const result = await response.json();
        alert(result.message);
        obtenerPropuestas();
    } catch (error) {
        console.error('Error al eliminar propuesta:', error);
    }
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
  
