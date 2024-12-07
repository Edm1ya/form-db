document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-usuario');
  const listaUsuarios = document.getElementById('usuarios-lista');
  let modoEdicion = false;
  let usuarioEditandoId = null;

  // Función para enviar los datos del formulario al servidor
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const edad = document.getElementById('edad').value;
    const telefono = document.getElementById('telefono').value;

    if (modoEdicion) {
      // Modo de actualización
      fetch(`/api/usuarios/${usuarioEditandoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre, 
          email, 
          edad: parseInt(edad), 
          telefono 
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Usuario actualizado:', data);
        resetFormulario();
        mostrarUsuarios();
      })
      .catch(error => {
        console.error('Error al actualizar usuario:', error);
        alert('Hubo un error al actualizar el usuario');
      });
    } else {
      // Modo de inserción
      fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre, 
          email, 
          edad: parseInt(edad), 
          telefono 
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Usuario agregado:', data);
        resetFormulario();
        mostrarUsuarios();
      })
      .catch(error => {
        console.error('Error al agregar usuario:', error);
        alert('Hubo un error al registrar el usuario');
      });
    }
  });

  // Función para mostrar los usuarios registrados
  function mostrarUsuarios() {
    fetch('/api/usuarios')
      .then(response => response.json())
      .then(data => {
        listaUsuarios.innerHTML = '';
        data.forEach(usuario => {
          const li = document.createElement('li');
          li.className = 'bg-gray-200 p-2 rounded text-gray-700 flex justify-between items-center';
          
          const infoDiv = document.createElement('div');
          infoDiv.textContent = `${usuario.nombre} - ${usuario.email} (Edad: ${usuario.edad}, Tel: ${usuario.telefono})`;
          
          const accionesDiv = document.createElement('div');
          accionesDiv.className = 'flex';
          // Botón de Editar
          const btnEditar = document.createElement('button');
          btnEditar.textContent = 'Editar';
          btnEditar.className = 'bg-blue-500 text-white px-2 py-1 rounded mr-2';
          btnEditar.addEventListener('click', () => cargarUsuarioParaEdicion(usuario));
          
          // Botón de Eliminar
          const btnEliminar = document.createElement('button');
          btnEliminar.textContent = 'Eliminar';
          btnEliminar.className = 'bg-red-500 text-white px-2 py-1 rounded';
          btnEliminar.addEventListener('click', () => eliminarUsuario(usuario.id));
          
          accionesDiv.appendChild(btnEditar);
          accionesDiv.appendChild(btnEliminar);
          
          li.appendChild(infoDiv);
          li.appendChild(accionesDiv);
          
          listaUsuarios.appendChild(li);
        });
      })
      .catch(error => console.error('Error al obtener usuarios:', error));
  }

  // Función para cargar usuario en modo edición
  function cargarUsuarioParaEdicion(usuario) {
    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('email').value = usuario.email;
    document.getElementById('edad').value = usuario.edad;
    document.getElementById('telefono').value = usuario.telefono;
    
    // Cambiar texto del botón y establecer modo edición
    form.querySelector('button[type="submit"]').textContent = 'Actualizar';
    modoEdicion = true;
    usuarioEditandoId = usuario.id;
  }

  // Función para eliminar usuario
  function eliminarUsuario(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      })
      .then(response => response.json())
      .then(data => {
        console.log('Usuario eliminado:', data);
        mostrarUsuarios();
      })
      .catch(error => {
        console.error('Error al eliminar usuario:', error);
        alert('Hubo un error al eliminar el usuario');
      });
    }
  }

  // Función para resetear el formulario
  function resetFormulario() {
    form.reset();
    form.querySelector('button[type="submit"]').textContent = 'Registrar';
    modoEdicion = false;
    usuarioEditandoId = null;
  }

  // Mostrar los usuarios al cargar la página
  mostrarUsuarios();
});