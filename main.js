document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://swapi.py4e.com/api/';
    const resultadosContenedor = document.getElementById('resultados');
    const filtrosSecundariosContenedor = document.getElementById('filtros-secundarios');
    const modal = document.getElementById('modal');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalImagen = document.getElementById('modal-imagen');
    const modalDetalles = document.getElementById('modal-detalles');
    const cerrarModal = document.getElementById('cerrar-modal');
    const barraBusqueda = document.getElementById('barra-busqueda');
    let paginaActual = 1;
    let categoriaActual = '';
    let datosActuales = [];
    let datosCompletos = {};

    // Función para obtener datos de la API con paginación
    const obtenerDatos = async (categoria, pagina = 1) => {
        try {
            const url = `${apiUrl}${categoria}/?page=${pagina}`;
            const respuesta = await fetch(url);
            if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
            return await respuesta.json();
        } catch (error) {
            mostrarErrorModal(`Error al obtener los datos: ${error.message}`);
            return null;
        }
    };

    // Función para obtener todos los datos de una categoría
    const obtenerTodosLosDatos = async (categoria) => {
        let datosCompletos = [];
        let pagina = 1;
        let datos;
        do {
            datos = await obtenerDatos(categoria, pagina);
            if (datos && datos.results) {
                datosCompletos = datosCompletos.concat(datos.results);
                pagina++;
            }
        } while (datos && datos.next);
        return datosCompletos;
    };

    // Función para obtener la URL de la imagen
    const obtenerUrlImagen = (categoria, id) => {
        const baseUrl = 'https://starwars-visualguide.com/assets/img/';
        const categorias = {
            'people': 'characters',
            'planets': 'planets',
            'starships': 'starships',
            'vehicles': 'vehicles',
            'species': 'species'
        };
        return `${baseUrl}${categorias[categoria] || 'characters'}/${id}.jpg`;
    };

    // Función para mostrar resultados
    const mostrarResultados = (datos, categoria) => {
        if (!datos || datos.length === 0) {
            resultadosContenedor.innerHTML = `<p>No se encontraron resultados para ${categoria}.</p>`;
            return;
        }

        datosActuales = datos;
        resultadosContenedor.innerHTML = datos.map(item => {
            const id = item.url.split('/').filter(Boolean).pop();
            const nombre = item.name || item.title;
            const imagenUrl = obtenerUrlImagen(categoria, id);

            return `
                <div class="card" data-id="${id}" data-categoria="${categoria}">
                    <div class="imagen-contenedor">
                        <img src="${imagenUrl}" alt="${nombre}" onError="this.src='https://via.placeholder.com/300?text=Imagen+No+Disponible';">
                    </div>
                    <h3>${nombre}</h3>
                </div>
            `;
        }).join('');

        const botonAnterior = document.getElementById('boton-anterior');
        const botonSiguiente = document.getElementById('boton-siguiente');

        botonAnterior.style.display = datos.previous ? 'block' : 'none';
        botonSiguiente.style.display = datos.next ? 'block' : 'none';
    };

    // Función para manejar los botones de filtro
    const manejarFiltro = async (categoria) => {
        categoriaActual = categoria;
        datosCompletos[categoria] = await obtenerTodosLosDatos(categoria);
        mostrarResultados(datosCompletos[categoria], categoria);
        mostrarFiltrosSecundarios(categoria);
    };

    // Función para mostrar filtros secundarios
    const mostrarFiltrosSecundarios = (categoria) => {
        filtrosSecundariosContenedor.innerHTML = '';
        const datos = datosCompletos[categoria];

        if (!datos || datos.length === 0) return;

        const filtros = {};
        datos.forEach(item => {
            if (categoria === 'people' && item.gender) {
                filtros[item.gender] = (filtros[item.gender] || 0) + 1;
            }
            if (categoria === 'planets' && item.climate) {
                filtros[item.climate] = (filtros[item.climate] || 0) + 1;
            }
        });

        for (const [valor, cantidad] of Object.entries(filtros)) {
            const botonFiltro = document.createElement('button');
            botonFiltro.textContent = `${valor} (${cantidad})`;
            botonFiltro.classList.add('btn-filtro-secundario');
            botonFiltro.setAttribute('data-filtro', valor);
            botonFiltro.setAttribute('data-categoria', categoria);
            filtrosSecundariosContenedor.appendChild(botonFiltro);
        }

        document.querySelectorAll('.btn-filtro-secundario').forEach(boton => {
            boton.addEventListener('click', () => {
                const categoria = boton.getAttribute('data-categoria');
                const filtro = boton.getAttribute('data-filtro');
                manejarFiltroSecundario(categoria, filtro);
            });
        });
    };

    // Función para manejar el filtro secundario
    const manejarFiltroSecundario = (categoria, filtro) => {
        const datosFiltrados = datosCompletos[categoria].filter(item => {
            if (categoria === 'people') return item.gender === filtro;
            if (categoria === 'planets') return item.climate === filtro;
            return false;
        });
        mostrarResultados(datosFiltrados, categoria);
    };

    // Función para mostrar el modal
    const mostrarModal = (id, categoria) => {
        const item = datosActuales.find(item => item.url.includes(id));
        if (!item) return;

        modalTitulo.textContent = item.name || item.title;
        modalImagen.innerHTML = `<img src="${obtenerUrlImagen(categoria, id)}" alt="${item.name || item.title}">`;

        const especificaciones = Object.entries(item).map(([clave, valor]) => {
            return `<li><strong>${clave}:</strong> ${valor}</li>`;
        }).join('');
        modalDetalles.innerHTML = especificaciones;

        modal.style.display = 'block';
    };

    // Función para mostrar mensaje de error en el modal
    const mostrarErrorModal = (mensaje) => {
        modalTitulo.textContent = 'Error';
        modalImagen.innerHTML = '';
        modalDetalles.innerHTML = `<p>${mensaje}</p>`;
        modal.style.display = 'block';
    };

    // Evento para cerrar el modal
    cerrarModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Evento para manejar clic en los resultados
    resultadosContenedor.addEventListener('click', (event) => {
        const card = event.target.closest('.card');
        if (card) {
            const id = card.getAttribute('data-id');
            const categoria = card.getAttribute('data-categoria');
            mostrarModal(id, categoria);
        }
    });

    // Evento para manejar los filtros de categoría
    document.querySelectorAll('.btn-filtro').forEach(boton => {
        boton.addEventListener('click', () => {
            const categoria = boton.getAttribute('data-categoria');
            manejarFiltro(categoria);
        });
    });

    // Evento para manejar la barra de búsqueda
    barraBusqueda.addEventListener('input', () => {
        const busqueda = barraBusqueda.value.toLowerCase();
        const resultadosFiltrados = datosActuales.filter(item => 
            (item.name || item.title).toLowerCase().includes(busqueda)
        );
        mostrarResultados(resultadosFiltrados, categoriaActual);
    });

    // Eventos de paginación
    document.getElementById('boton-anterior').addEventListener('click', async () => {
        paginaActual--;
        const datos = await obtenerDatos(categoriaActual, paginaActual);
        mostrarResultados(datos, categoriaActual);
    });

    document.getElementById('boton-siguiente').addEventListener('click', async () => {
        paginaActual++;
        const datos = await obtenerDatos(categoriaActual, paginaActual);
        mostrarResultados(datos, categoriaActual);
    });
});