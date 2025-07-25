// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const modal = document.getElementById('modalAccidente');
    const abrirModalBtn = document.getElementById('abrirModalCrear');
    const closeBtn = document.querySelector('.close-button');
    const formAccidente = document.getElementById('formAccidente');
    const tablaAccidentesBody = document.querySelector('#tablaAccidentes tbody');
    const filterInput = document.getElementById('filterInput'); 
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn'); 

    // Elementos para la importación
    const importExcelInput = document.getElementById('importExcelInput');
    const importExcelBtn = document.getElementById('importExcelBtn');

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
    // Variable para mantener el último ID generado para asegurar unicidad
    let lastId = accidentes.length > 0 ? Math.max(...accidentes.map(acc => acc.id)) : 0;

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
            const index = accidentes.findIndex(acc => acc.id == parseInt(id)); // Usar parseInt(id)
            if (index > -1) {
                accidentes[index] = { id: parseInt(id), ...newAccidenteData };
            }
        } else {
            // **CREATE**: Crear nuevo accidente
            lastId++; // Incrementar el ID
            accidentes.push({ id: lastId, ...newAccidenteData });
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
            // Filtrar y mantener solo los accidentes cuyo ID no coincide con el ID a eliminar
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

    // --- Funcionalidad de Importar desde Excel (.xlsx) ---
    // Actualizamos el atributo accept del input file para que solo acepte archivos .xlsx
    importExcelInput.setAttribute('accept', '.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    importExcelBtn.addEventListener('click', () => {
        importExcelInput.click(); // Simula el clic en el input de archivo oculto
    });

    importExcelInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Asume que la primera hoja es la que contiene los datos
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convierte la hoja de trabajo a un array de JSON
                // header: 1 asegura que la primera fila sea usada como encabezados para las claves
                const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (importedData.length === 0) {
                    alert('El archivo Excel está vacío o no se pudieron leer los datos.');
                    return;
                }

                const headers = importedData[0].map(h => String(h).trim()); // Obtener y limpiar encabezados de la primera fila
                const rawRows = importedData.slice(1); // Obtener solo las filas de datos reales

                const newAccidentsFromImport = rawRows.map(row => {
                    let accData = {};
                    headers.forEach((header, index) => {
                        let value = row[index];
                        if (value === undefined || value === null) value = ''; // Manejar valores nulos/indefinidos

                        switch (header.toLowerCase()) {
                            case 'id':
                                // No usamos el ID del Excel al importar para prevenir duplicados.
                                // Siempre generamos uno nuevo.
                                break; 
                            case 'fecha':
                                if (typeof value === 'number') {
                                    accData.fecha = new Date(Math.round((value - 25569) * 86400 * 1000)).toISOString().split('T')[0];
                                } else {
                                    accData.fecha = String(value);
                                }
                                break;
                            case 'persona':
                            case 'nombre de la persona':
                                accData.nombrePersona = String(value);
                                break;
                            case 'tipo':
                            case 'tipo de accidente':
                                accData.tipo = String(value);
                                break;
                            case 'mortalidad':
                                accData.mortalidad = String(value).toLowerCase() === 'sí' || String(value).toLowerCase() === 'si' ? 'si' : 'no';
                                break;
                            case 'genero':
                                accData.genero = String(value).toLowerCase();
                                break;
                            case 'area':
                                accData.area = String(value);
                                break;
                            case 'parte del cuerpo':
                                accData.parteCuerpo = String(value);
                                break;
                            case 'lugar':
                            case 'dónde ocurrió el accidente':
                                accData.lugarAccidente = String(value);
                                break;
                            case 'objeto lesión':
                            case 'con qué se lesionó':
                                accData.objetoLesion = String(value);
                                break;
                            case 'descripción':
                                accData.descripcion = String(value);
                                break;
                            default:
                                break;
                        }
                    });

                    // Generar un nuevo ID único para cada registro importado
                    lastId++; 
                    accData.id = lastId;
                    
                    return accData;
                }).filter(acc => acc.fecha && acc.nombrePersona); // Filtrar filas que no tienen datos esenciales

                // **CORRECCIÓN CLAVE: En lugar de reemplazar, añadimos los nuevos accidentes.**
                accidentes = accidentes.concat(newAccidentsFromImport); 

                saveData();
                updateDashboard();
                renderTable(filterInput.value);
                alert(`Se han importado ${newAccidentsFromImport.length} registros nuevos desde el archivo Excel.`);
            };

            reader.onerror = function(ex) {
                console.error("Error al leer el archivo:", ex);
                alert('Error al leer el archivo. Asegúrate de que sea un archivo Excel (.xlsx) válido.');
            };

            reader.readAsArrayBuffer(file); // Leer el archivo como un ArrayBuffer
        }
    });

    // --- Funcionalidad de Exportar a Excel (.xlsx) ---
    exportExcelBtn.addEventListener('click', () => {
        // Preparar los datos para SheetJS
        const dataToExport = accidentes.map(acc => ({
            ID: acc.id,
            Fecha: acc.fecha,
            Persona: acc.nombrePersona,
            Tipo: acc.tipo,
            Mortalidad: acc.mortalidad === 'si' ? 'Sí' : 'No', // Volver a 'Sí'/'No' para el export
            Genero: acc.genero.charAt(0).toUpperCase() + acc.genero.slice(1),
            Area: acc.area,
            'Parte del Cuerpo': acc.parteCuerpo,
            Lugar: acc.lugarAccidente,
            'Objeto Lesión': acc.objetoLesion,
            Descripción: acc.descripcion
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Accidentes");

        // Generar el archivo y descargarlo
        XLSX.writeFile(workbook, `accidentes_reporte_${new Date().toLocaleDateString('es-ES')}.xlsx`);
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

        TIPOS_ACCIDENTE.forEach(tipo => {
            const count = accidentes.filter(acc => acc.tipo === tipo).length;
            const element = document.getElementById(`tipo${tipo.replace(/\s/g, '')}`); 
            if (element) {
                element.textContent = count;
            }
        });

        AREAS.forEach(area => {
            const count = accidentes.filter(acc => acc.area === area).length;
            const element = document.getElementById(`area${area.replace(/\s/g, '')}`); 
            if (element) {
                element.textContent = count;
            }
        });

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
                    backgroundColor: ['#1abc9c', '#f39c12', '#9b59b6', '#34495e', '#7f8c8d', '#c0392b', '#2980b9', '#8e44ad', '#2c3e50', '#d35400', '#2ecc71'], 
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