document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-usuario');
    const listaUsuarios = document.getElementById('usuarios-lista');
  
    // Función para enviar los datos del formulario al servidor
    form.addEventListener('submit', function (event) {
      event.preventDefault();
  
      const nombre = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;
  
      fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Usuario agregado:', data);
        mostrarUsuarios();
      })
      .catch(error => console.error('Error al agregar usuario:', error));
    });
  
    // Función para mostrar los usuarios registrados
    function mostrarUsuarios() {
      fetch('/api/usuarios')
        .then(response => response.json())
        .then(data => {
          listaUsuarios.innerHTML = '';
          data.forEach(usuario => {
            const li = document.createElement('li');
            li.textContent = `${usuario.nombre} - ${usuario.email}`;
            listaUsuarios.appendChild(li);
          });
        })
        .catch(error => console.error('Error al obtener usuarios:', error));
    }
  
    // Mostrar los usuarios al cargar la página
    mostrarUsuarios();
  });
  