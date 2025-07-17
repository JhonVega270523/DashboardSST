// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const modal = document.getElementById('modalAccidente');
    const abrirModalBtn = document.getElementById('abrirModalCrear');
    const closeBtn = document.querySelector('.close-button');
    const formAccidente = document.getElementById('formAccidente');
    const tablaAccidentesBody = document.querySelector('#tablaAccidentes tbody');
    const filterInput = document.getElementById('filterInput'); // Nuevo: referencia al input de filtro
    const exportExcelBtn = document.getElementById('exportExcelBtn'); // Nuevo: referencia al botón de exportar
    const exportPdfBtn = document.getElementById('exportPdfBtn'); // Nuevo: Referencia al botón PDF!

    // --- Elementos para el botón de scroll-to-top ---
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scrollTopBtn';
    scrollTopBtn.innerHTML = '⬆️'; // Flecha hacia arriba
    document.body.appendChild(scrollTopBtn); // Añadir el botón al body

    // Definición de todos los tipos de accidente y áreas para un manejo centralizado
    const TIPOS_ACCIDENTE = ["Colisión", "Atropello", "Caída", "Quemadura", "Corte", "Electrocución", "Vuelco"];
    const AREAS = ["Sistemas", "Calidad", "Planta", "Facturación", "Contabilidad", "Gerencia", "Administración", "Ventas"];

    // --- Simulación de Datos (En un entorno REAL, estos datos vendrían de un API de backend) ---
    // Usaremos localStorage para simular persistencia en el navegador
    // Se inicia con los datos guardados o un array vacío si no hay nada
    let accidentes = JSON.parse(localStorage.getItem('accidentesData')) || []; 

    // --- Funciones para manejar el Modal (Formulario CRUD) ---
    abrirModalBtn.addEventListener('click', () => {
        modal.style.display = 'flex'; // Mostrar el modal
        formAccidente.reset(); // Limpiar el formulario
        document.getElementById('accidenteId').value = ''; // Resetear ID oculto
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none'; // Ocultar el modal
    });

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // --- Operaciones CRUD ---

    /**
     * Maneja el envío del formulario para crear o actualizar un accidente.
     */
    formAccidente.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        const id = document.getElementById('accidenteId').value;
        const fecha = document.getElementById('fecha').value;
        const nombrePersona = document.getElementById('nombrePersona').value;
        const tipo = document.getElementById('tipo').value;
        const mortalidad = document.getElementById('mortalidad').value;
        const genero = document.getElementById('genero').value;
        const area = document.getElementById('area').value;
        const parteCuerpo = document.getElementById('parteCuerpo').value; 
        const lugarAccidente = document.getElementById('lugarAccidente').value; 
        const objetoLesion = document.getElementById('objetoLesion').value; 
        const descripcion = document.getElementById('descripcion').value;

        const newAccidenteData = { 
            fecha, 
            nombrePersona, 
            tipo, 
            mortalidad, 
            genero, 
            area, 
            parteCuerpo, 
            lugarAccidente, 
            objetoLesion, 
            descripcion 
        };

        if (id) {
            // **UPDATE**: Actualizar accidente existente
            const index = accidentes.findIndex(acc => acc.id == id);
            if (index > -1) {
                accidentes[index] = { id: parseInt(id), ...newAccidenteData };
            }
        } else {
            // **CREATE**: Crear nuevo accidente
            const newId = accidentes.length > 0 ? Math.max(...accidentes.map(acc => acc.id)) + 1 : 1;
            accidentes.push({ id: newId, ...newAccidenteData });
        }
        
        saveData(); // Guardar cambios en localStorage
        modal.style.display = 'none'; // Ocultar el modal
        updateDashboard(); // Actualizar estadísticas y gráficos
        renderTable(filterInput.value); // Volver a renderizar la tabla aplicando el filtro actual
    });

    /**
     * Renderiza la tabla de accidentes con los datos actuales, aplicando el filtro si existe.
     * @param {string} filterText - Texto para filtrar las filas de la tabla.
     */
    function renderTable(filterText = '') {
        tablaAccidentesBody.innerHTML = ''; // Limpiar tabla actual
        const lowerCaseFilter = filterText.toLowerCase();

        // Filtrar los accidentes antes de renderizar
        const filteredAccidentes = accidentes.filter(acc => {
            return Object.values(acc).some(value => 
                String(value).toLowerCase().includes(lowerCaseFilter)
            );
        });

        filteredAccidentes.forEach(acc => {
            const row = tablaAccidentesBody.insertRow();
            row.insertCell().textContent = acc.id;
            row.insertCell().textContent = acc.fecha;
            row.insertCell().textContent = acc.nombrePersona;
            row.insertCell().textContent = acc.tipo;
            row.insertCell().textContent = acc.mortalidad === 'si' ? 'Sí' : 'No';
            row.insertCell().textContent = acc.genero.charAt(0).toUpperCase() + acc.genero.slice(1); // Capitalizar
            row.insertCell().textContent = acc.area;
            row.insertCell().textContent = acc.parteCuerpo;
            row.insertCell().textContent = acc.lugarAccidente;
            row.insertCell().textContent = acc.objetoLesion;
            row.insertCell().textContent = acc.descripcion;

            const actionsCell = row.insertCell();
            actionsCell.classList.add('action-buttons');

            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️ Editar';
            editBtn.classList.add('edit-btn');
            editBtn.addEventListener('click', () => editAccidente(acc.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️ Eliminar';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => deleteAccidente(acc.id));

            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
        });
    }

    /**
     * Carga los datos de un accidente en el formulario para su edición.
     * @param {number} id - El ID del accidente a editar.
     */
    function editAccidente(id) {
        const acc = accidentes.find(a => a.id === id);
        if (acc) {
            document.getElementById('accidenteId').value = acc.id;
            document.getElementById('fecha').value = acc.fecha;
            document.getElementById('nombrePersona').value = acc.nombrePersona;
            document.getElementById('tipo').value = acc.tipo;
            document.getElementById('mortalidad').value = acc.mortalidad;
            document.getElementById('genero').value = acc.genero;
            document.getElementById('area').value = acc.area;
            document.getElementById('parteCuerpo').value = acc.parteCuerpo;
            document.getElementById('lugarAccidente').value = acc.lugarAccidente;
            document.getElementById('objetoLesion').value = acc.objetoLesion;
            document.getElementById('descripcion').value = acc.descripcion;
            modal.style.display = 'flex'; // Mostrar el modal para edición
        }
    }

    /**
     * Elimina un accidente de la lista.
     * @param {number} id - El ID del accidente a eliminar.
     */
    function deleteAccidente(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este accidente? Esta acción no se puede deshacer.')) {
            accidentes = accidentes.filter(acc => acc.id !== id);
            saveData(); // Guardar cambios en localStorage
            updateDashboard(); // Actualizar estadísticas y gráficos
            renderTable(filterInput.value); // Volver a renderizar la tabla aplicando el filtro actual
        }
    }

    /**
     * Guarda los datos actuales de los accidentes en localStorage.
     */
    function saveData() {
        localStorage.setItem('accidentesData', JSON.stringify(accidentes));
    }

    // --- Filtrado de la tabla ---
    filterInput.addEventListener('keyup', () => {
        renderTable(filterInput.value);
    });

    // --- Funcionalidad de Exportar a Excel ---
    exportExcelBtn.addEventListener('click', () => {
        const table = document.getElementById('tablaAccidentes');
        let csv = [];
        const BOM = "\uFEFF"; // Byte Order Mark for UTF-8

        // Obtener los encabezados de la tabla
        let headers = [];
        table.querySelectorAll('thead th').forEach((th, index) => {
            // Excluir la columna "Acciones"
            if (th.textContent.trim() !== 'Acciones') {
                headers.push(th.textContent.trim());
            }
        });
        csv.push(headers.join(';')); // Unir encabezados con punto y coma como delimitador

        // Obtener las filas visibles (filtradas) de la tabla
        table.querySelectorAll('tbody tr').forEach(row => {
            let rowData = [];
            row.querySelectorAll('td').forEach((cell, index) => {
                // Excluir la última celda que contiene los botones de acción
                if (index < row.cells.length - 1) { 
                    let cellText = cell.textContent.trim();
                    // Escapar comillas dobles y asegurarse de que el contenido con ';' o ',' esté entre comillas
                    // Esto es crucial para manejar datos que contengan el delimitador o saltos de línea
                    if (cellText.includes(';') || cellText.includes('\n') || cellText.includes('"')) {
                        cellText = '"' + cellText.replace(/"/g, '""') + '"'; // Escapa comillas dobles
                    }
                    rowData.push(cellText);
                }
            });
            csv.push(rowData.join(';')); // Unir datos de fila con punto y coma
        });

        const csvString = BOM + csv.join('\n'); // Prepend BOM
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `accidentes_filtrados_${new Date().toLocaleDateString('es-ES')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // --- Funcionalidad de Exportar a PDF ---
    exportPdfBtn.addEventListener('click', () => {
        const doc = new window.jspdf.jsPDF(); // Usar window.jspdf.jsPDF
        const table = document.getElementById('tablaAccidentes');

        // Preparar encabezados (excluir "Acciones")
        const headers = Array.from(table.querySelectorAll('thead th'))
                                     .filter(th => th.textContent.trim() !== 'Acciones')
                                     .map(th => th.textContent.trim());

        // Preparar datos (excluir la columna "Acciones")
        const data = [];
        table.querySelectorAll('tbody tr').forEach(row => {
            const rowData = Array.from(row.querySelectorAll('td'))
                                     .filter((td, index, arr) => index < arr.length - 1) // Excluir la última columna
                                     .map(td => td.textContent.trim());
            data.push(rowData);
        });

        // Título del documento
        doc.setFontSize(18);
        doc.text("Reporte de Accidentes SST", 14, 22);

        // Generar la tabla en el PDF
        doc.autoTable({
            head: [headers],
            body: data,
            startY: 30, // Posición inicial de la tabla
            theme: 'striped', // Estilo de tabla (striped, grid, plain)
            styles: {
                fontSize: 8,
                cellPadding: 3,
                valign: 'middle'
            },
            headStyles: {
                fillColor: [44, 62, 80], // Color de fondo del header (azul oscuro)
                textColor: [255, 255, 255], // Color de texto blanco
                fontStyle: 'bold'
            },
            columnStyles: {
                // Puedes definir estilos para columnas específicas si es necesario
                // Por ejemplo, para alargar la columna de descripción:
                // 10: { cellWidth: 'auto' } // Asumiendo que descripción es la columna 10 (índice 9)
            }
        });

        // Guardar el PDF
        doc.save(`accidentes_reporte_${new Date().toLocaleDateString('es-ES')}.pdf`);
    });


    // --- Actualización del Dashboard y Gráficos ---

    // Variables para las instancias de Chart.js
    let chartMortalidad, chartGenero, chartArea, chartTipo, chartMesAnio;

    /**
     * Actualiza las estadísticas clave y renderiza todos los gráficos.
     */
    function updateDashboard() {
        // Actualizar estadísticas clave generales
        document.getElementById('totalAccidentes').textContent = accidentes.length;
        document.getElementById('mortalidadAccidentes').textContent = accidentes.filter(acc => acc.mortalidad === 'si').length;
        document.getElementById('generoFemenino').textContent = accidentes.filter(acc => acc.genero === 'femenino').length;
        document.getElementById('generoMasculino').textContent = accidentes.filter(acc => acc.genero === 'masculino').length;

        // Estas actualizaciones de estadísticas por Tipo y Área en el HTML no existen en el HTML actual,
        // pero las dejo en el JS por si se agregaran en el futuro o para referencia.
        TIPOS_ACCIDENTE.forEach(tipo => {
            const count = accidentes.filter(acc => acc.tipo === tipo).length;
            const element = document.getElementById(`tipo${tipo.replace(/\s/g, '')}`); // Remove spaces for ID
            if (element) {
                element.textContent = count;
            }
        });

        AREAS.forEach(area => {
            const count = accidentes.filter(acc => acc.area === area).length;
            const element = document.getElementById(`area${area.replace(/\s/g, '')}`); // Remove spaces for ID
            if (element) {
                element.textContent = count;
            }
        });

        // Estadísticas: Accidentes por Mes/Año (estas IDs tampoco existen en el HTML proporcionado)
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const accidentesEsteMes = accidentes.filter(acc => {
            const accDate = new Date(acc.fecha);
            return accDate.getMonth() === currentMonth && accDate.getFullYear() === currentYear;
        }).length;
        const elementMes = document.getElementById('accidentesEsteMes');
        if (elementMes) elementMes.textContent = accidentesEsteMes;


        const accidentesEsteAnio = accidentes.filter(acc => {
            const accDate = new Date(acc.fecha);
            return accDate.getFullYear() === currentYear;
        }).length;
        const elementAnio = document.getElementById('accidentesEsteAnio');
        if (elementAnio) elementAnio.textContent = accidentesEsteAnio;

        renderCharts();
    }

    /**
     * Renderiza todos los gráficos del dashboard.
     */
    function renderCharts() {
        // --- Gráfico de Mortalidad --- 
        const mortalidadData = {
            si: accidentes.filter(acc => acc.mortalidad === 'si').length,
            no: accidentes.filter(acc => acc.mortalidad === 'no').length,
        };
        const ctxMortalidad = document.getElementById('chartMortalidad').getContext('2d');
        if (chartMortalidad) chartMortalidad.destroy(); 
        chartMortalidad = new Chart(ctxMortalidad, {
            type: 'pie',
            data: {
                labels: ['Con Mortalidad', 'Sin Mortalidad'],
                datasets: [{
                    data: [mortalidadData.si, mortalidadData.no],
                    backgroundColor: ['#e74c3c', '#2ecc71'], 
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Mortalidad por Accidente', font: { size: 16, weight: 'bold' } }
                }
            }
        });

        // --- Gráfico por Género --- 
        const generoCounts = accidentes.reduce((acc, current) => {
            acc[current.genero] = (acc[current.genero] || 0) + 1;
            return acc;
        }, {});
        const generoLabels = Object.keys(generoCounts).map(g => g.charAt(0).toUpperCase() + g.slice(1));
        const generoValues = Object.values(generoCounts);
        const ctxGenero = document.getElementById('chartGenero').getContext('2d');
        if (chartGenero) chartGenero.destroy();
        chartGenero = new Chart(ctxGenero, {
            type: 'bar',
            data: {
                labels: generoLabels,
                datasets: [{
                    label: 'Número de Accidentes',
                    data: generoValues,
                    backgroundColor: ['#3498db', '#f1c40f', '#95a5a6'],
                    borderColor: ['#2980b9', '#d4ac0d', '#7f8c8d'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } } },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Accidentes por Género', font: { size: 16, weight: 'bold' } }
                }
            }
        });

        // --- Gráfico por Área --- 
        const areaCounts = accidentes.reduce((acc, current) => {
            acc[current.area] = (acc[current.area] || 0) + 1;
            return acc;
        }, {});
        const ctxArea = document.getElementById('chartArea').getContext('2d');
        if (chartArea) chartArea.destroy();
        chartArea = new Chart(ctxArea, {
            type: 'doughnut',
            data: {
                labels: Object.keys(areaCounts),
                datasets: [{
                    data: Object.values(areaCounts),
                    backgroundColor: ['#1abc9c', '#f39c12', '#9b59b6', '#34495e', '#7f8c8d', '#c0392b', '#2980b9', '#8e44ad', '#2c3e50', '#d35400', '#2ecc71'], // Más colores para más áreas
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Accidentes por Área', font: { size: 16, weight: 'bold' } }
                }
            }
        });

        // --- Gráfico por Tipo de Accidente --- 
        const tipoCounts = accidentes.reduce((acc, current) => {
            acc[current.tipo] = (acc[current.tipo] || 0) + 1;
            return acc;
        }, {});
        const ctxTipo = document.getElementById('chartTipo').getContext('2d');
        if (chartTipo) chartTipo.destroy();
        chartTipo = new Chart(ctxTipo, {
            type: 'bar', 
            data: {
                labels: Object.keys(tipoCounts),
                datasets: [{
                    label: 'Número de Accidentes',
                    data: Object.values(tipoCounts),
                    backgroundColor: '#e67e22', 
                    borderColor: '#d35400',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y', // Hace las barras horizontales
                scales: { x: { beginAtZero: true, title: { display: true, text: 'Cantidad' } } },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Accidentes por Tipo', font: { size: 16, weight: 'bold' } }
                }
            }
        });

        // --- Gráfico por Mes/Año --- 
        const monthlyData = accidentes.reduce((acc, current) => {
            const date = new Date(current.fecha);
            const monthYear = date.toLocaleString('es-ES', { month: 'short', year: 'numeric' }); 
            acc[monthYear] = (acc[monthYear] || 0) + 1;
            return acc;
        }, {});

        // Asegúrate de que los meses estén ordenados cronológicamente
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
            // Adaptar para analizar el formato "abreviado año" (ej. "jul. 2024")
            const partsA = a.split(' ');
            const monthNameA = partsA[0].replace('.', ''); 
            const yearA = parseInt(partsA[1]);
            const monthIndexA = new Date(Date.parse(monthNameA + " 1, 2000")).getMonth(); 
            const dateA = new Date(yearA, monthIndexA);

            const partsB = b.split(' ');
            const monthNameB = partsB[0].replace('.', '');
            const yearB = parseInt(partsB[1]);
            const monthIndexB = new Date(Date.parse(monthNameB + " 1, 2000")).getMonth();
            const dateB = new Date(yearB, monthIndexB);

            return dateA - dateB;
        });

        const monthlyValues = sortedMonths.map(month => monthlyData[month]);

        const ctxMesAnio = document.getElementById('chartMesAnio').getContext('2d');
        if (chartMesAnio) chartMesAnio.destroy();
        chartMesAnio = new Chart(ctxMesAnio, {
            type: 'line',
            data: {
                labels: sortedMonths,
                datasets: [{
                    label: 'Número de Accidentes',
                    data: monthlyValues,
                    borderColor: '#27ae60', 
                    backgroundColor: 'rgba(46, 204, 113, 0.2)', 
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#27ae60',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#27ae60'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } },
                    x: { title: { display: true, text: 'Mes y Año' } }
                },
                plugins: {
                    title: { display: true, text: 'Accidentes por Mes/Año', font: { size: 16, weight: 'bold' } }
                }
            }
        });
    }

    // --- Lógica del botón scroll-to-top ---
    window.addEventListener('scroll', () => {
        // Muestra el botón si el scroll vertical es mayor a 200px
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            scrollTopBtn.classList.add('show'); // Añade la clase para mostrar
        } else {
            scrollTopBtn.classList.remove('show'); // Quita la clase para ocultar
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        // Desplaza la página suavemente hasta arriba
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- DESHABILITAR CLIC DERECHO PARA SEGURIDAD BÁSICA ---
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault(); // Previene la acción por defecto del clic derecho
    });

    // --- Inicialización del Dashboard al cargar la página ---
    updateDashboard(); // Cargar estadísticas y gráficos con los datos existentes en localStorage
    renderTable(); // Cargar la tabla con los datos existentes en localStorage
});