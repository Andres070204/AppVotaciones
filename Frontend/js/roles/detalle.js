document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
      alert('Por favor, inicia sesión primero.');
      window.location.href = '/html/Usuarios/login.html';
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
  document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
  
    if (id) {
      try {
          const response = await fetch(`http://localhost:3000/ciudadano/propuestas/${id}`);
        if (!response.ok) {
          throw new Error('Error al obtener los detalles de la propuesta.');
        }
        const propuesta = await response.json();
        document.getElementById('tituloPropuesta').textContent = propuesta.titulo;
        document.getElementById('descripcionPropuesta').textContent = propuesta.descripcion;
        const nombreLocalidad = localidadesNombres[propuesta.localidad] || propuesta.localidad;
        document.getElementById('localidadPropuesta').textContent = nombreLocalidad;
        document.getElementById('presupuestoPropuesta').textContent = `$${propuesta.presupuesto.toLocaleString()}`;
        document.getElementById('fechaInicioPropuesta').textContent = formatearFechaParaColombia(propuesta.fechaInicio);
        document.getElementById('fechaFinPropuesta').textContent = formatearFechaParaColombia(propuesta.fechaFin);
        
        // Configuración del mapa
        const coords = propuesta.ubicacion.split(',').map(coord => parseFloat(coord.trim()));
        const map = L.map('map').setView(coords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap'
        }).addTo(map);
        L.marker(coords).addTo(map);
      } catch (error) {
        console.error('Error al cargar detalles de la propuesta:', error);
        alert('Error al cargar los detalles de la propuesta.');
      }
    } else {
      alert('No se ha proporcionado un ID de propuesta.');
    }
  });
  async function cargarDetalles(id) {
    
    try {
        const propuestaResponse = await fetch(`http://localhost:3000/ciudadano/propuestas/${id}`);
        
        if (!propuestaResponse.ok) {
            throw new Error('Error al obtener los detalles de la propuesta.');
        }

        const propuesta = await propuestaResponse.json();
        mostrarDetallesPropuesta(propuesta);

        const userToken = localStorage.getItem('token');
  if (userToken) {
  const userId = decodeToken(userToken).userId;
}


        // Comprobar el voto existente
        const votoResponse = await fetch(`http://localhost:3000/ciudadano/propuestas/${id}/voto/${userId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });
        
        
        if (!votoResponse.ok) {
            throw new Error('Error al verificar el voto existente.');
        }
        
        const votoExistente = await votoResponse.json();

        // Deshabilitar botones si ya se ha votado
        const voteButtons = document.querySelectorAll('.btn-vote');
        if (votoExistente) {
            voteButtons.forEach(button => button.disabled = true);
            alert('Ya has votado por esta propuesta.'); // Notificar al usuario
        } else {
            voteButtons.forEach(button => button.disabled = false);
        }

    } catch (error) {
        console.error('Error al cargar detalles de la propuesta:', error);
        alert('Error al cargar los detalles de la propuesta: ' + error.message);
    }
}

 
  function formatearFechaParaColombia(fechaISO) {
    const fecha = new Date(fechaISO);
    const opciones = { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' };
    return fecha.toLocaleDateString('es-CO', opciones);
  }
  function votarFavor() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
  
    if (id) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Por favor, inicia sesión primero.');
        return;
      }
  
      fetch(`http://localhost:3000/ciudadano/propuestas/${id}/votar/favor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Token con identificacion
        },
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(error => {
              console.error('Error del servidor:', error);
              throw new Error(error.message || 'Error al registrar el voto.');
            });
          }
          return response.json();
        })
        .then(data => {
          alert('Voto registrado correctamente.');
        })
        .catch(error => {
          alert(`Hubo un problema: ${error.message}`);
        });
      
    } else {
      alert('No se ha proporcionado un ID de propuesta.');
    }
  }
  
  function votarContra() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
  
    if (id) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Por favor, inicia sesión primero.');
        return;
      }
  
      fetch(`http://localhost:3000/ciudadano/propuestas/${id}/votar/contra`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Token con identificacion
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((error) => {
              console.error('Error del servidor:', error);
              throw new Error(error.message || 'Error al registrar el voto en contra.');
            });
          }
          return response.json();
        })
        .then((data) => {
          alert('Voto en contra registrado correctamente.');
          console.log('Respuesta del servidor:', data);
        })
        .catch((error) => {
          alert(`Hubo un problema: ${error.message}`);
        });
    } else {
      alert('No se ha proporcionado un ID de propuesta.');
    }
  }
  
  function verificarVotoPrevio() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Por favor, inicia sesión primero.');
    return;
  }

  fetch('http://localhost:3000/ciudadano/verificar-voto', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Ya has votado en una propuesta.');
      }
      return response.json();
    })
    .then(() => {
      // Permitir votar
      alert('Puedes votar.');
    })
    .catch((error) => {
      alert(error.message);
    });
}

  
  function abrirEnGoogleMaps() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
  
    if (id) {
      // Obtener la propuesta para acceder a la ubicación
      fetch(`http://localhost:3000/ciudadano/propuestas/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al obtener la propuesta.');
          }
          return response.json();
        })
        .then(propuesta => {
          const coords = propuesta.ubicacion.split(',').map(coord => parseFloat(coord.trim()));
          const lat = coords[0];
          const lng = coords[1];
          
          // Construir la URL de Google Maps
          const url = `https://www.google.com/maps?q=${lat},${lng}`;
          window.open(url, '_blank'); // Abrir en una nueva pestaña
        })
        .catch(error => {
          console.error('Error al abrir Google Maps:', error);
          alert('Hubo un problema al abrir Google Maps.');
        });
    } else {
      alert('No se ha proporcionado un ID de propuesta.');
    }
  }
  function decodeToken(token) {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)); // Decodifica la carga útil del token
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
  