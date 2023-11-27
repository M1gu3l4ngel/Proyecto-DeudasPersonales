//-----------------------------------------------
// Dark/Light Mode
//-----------------------------------------------
const checkbox = document.querySelector('input[name=mode]');

checkbox.addEventListener('change', function () {
    trans();
    const theme = this.checked ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('data-theme', theme);
});

let trans = () => {
    document.documentElement.classList.add('transition');
    window.setTimeout(() => {
        document.documentElement.classList.remove('transition');
    }, 1000);
}

const storedTheme = localStorage.getItem('data-theme');
if (storedTheme) {
    document.documentElement.dataset.theme = storedTheme;
}
//-----------------------------------------------



//-----------------------------------------------
// Funcionamiento del Programa / Deudas Personales
//-----------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    // Cargar las deudas almacenadas en localStorage
    let deudas = JSON.parse(localStorage.getItem('deudas')) || [];

    function guardarDeudasEnLocalStorage() {
        localStorage.setItem('deudas', JSON.stringify(deudas));
    }

    mostrarDeudas();
    actualizarTotalDeudas();

    window.agregarDeuda = function () {
        const nombreInput = document.getElementById('nombre');
        const descripcionInput = document.getElementById('descripcion');
        const montoTotalInput = document.getElementById('montoTotal');

        const nombre = nombreInput.value;
        const descripcion = descripcionInput.value;
        const montoTotal = parseFloat(montoTotalInput.value);

        // Validar que los campos obligatorios estén llenos
        if (!nombre || !descripcion || isNaN(montoTotal)) {
            mostrarNotificacion('danger', 'Por favor, completa todos los campos para agregar una deuda.');
            return;
        }

        // Buscar si ya existe una deuda con el mismo nombre
        const deudaExistente = deudas.find(d => d.nombre === nombre);

        if (deudaExistente) {
            // Sumar el monto total de la nueva deuda a la deuda existente
            deudaExistente.montoTotal += montoTotal;
        } else {
            // Si no existe, agregar una nueva deuda
            const deuda = {
                nombre,
                descripcion,
                montoTotal,
                abonado: 0
            };

            deudas.push(deuda);            
        }

        // Restablecer valores del formulario
        nombreInput.value = '';
        descripcionInput.value = '';
        montoTotalInput.value = '';

        mostrarDeudas();
        actualizarTotalDeudas();
        guardarDeudasEnLocalStorage();
        mostrarNotificacion('success', 'Deuda agregada correctamente.');
    }

    window.abonarDeuda = function (index) {
        const deuda = deudas[index];

        mostrarDeudas();
        actualizarTotalDeudas();
        guardarDeudasEnLocalStorage();


        if (deuda) {
            document.getElementById('abonarModalLabel').innerText = `Abonar a ${deuda.nombre}`;
            // Asignar el índice de la deuda actual al botón de abonar
            document.getElementById('abonarModal').dataset.deudaIndex = index;
            // Limpiar el campo de abono en el modal
            document.getElementById('abonoModal').value = '';
            // Mostrar el modal
            $('#abonarModal').modal('show');
        } else {
            mostrarNotificacion('warning', 'No se encontró ninguna deuda para ese nombre.');
        }
    }

    window.abonarDeudaModal = function () {
        const index = document.getElementById('abonarModal').dataset.deudaIndex;
        const abono = parseFloat(document.getElementById('abonoModal').value);

        // Validar que el abono sea un número válido
        if (isNaN(abono)) {
            mostrarNotificacion('danger', 'Por favor, ingresa un monto válido.');
            return;
        }

        const deuda = deudas[index];

        if (deuda) {
            const saldoPendiente = deuda.montoTotal - deuda.abonado;

            if (abono > saldoPendiente) {
                mostrarNotificacion('danger', 'No puedes abonar más de la deuda pendiente.');
                return;
            }

            deuda.abonado += abono;

            if (deuda.abonado >= deuda.montoTotal) {
                // Marcar la deuda como completamente saldada
                deuda.abonado = deuda.montoTotal;

                // Eliminar la deuda del array
                deudas = deudas.filter(d => d.nombre !== deuda.nombre);
            }

            mostrarDeudas();
            actualizarTotalDeudas();
            guardarDeudasEnLocalStorage();

            // Cerrar el modal
            $('#abonarModal').modal('hide');

            // Restablecer estilos del body después de cerrar el modal
            $('body').css('overflow', 'auto');
            $('body').css('padding-right', '0');

            // Mostrar notificación verde
            mostrarNotificacion('success', 'Abono realizado correctamente.');
        }
    }

    function mostrarDeudas() {
        const debtListContainer = document.getElementById('debtList');
        const noDebtMessage = document.getElementById('noDebtMessage');

        // Limpia el contenido actual
        debtListContainer.innerHTML = '';

        if (deudas.length === 0) {
            // No hay deudas, mostrar el mensaje
            noDebtMessage.style.display = 'block';
        } else {
            noDebtMessage.style.display = 'none';

            // Hay deudas, mostrarlas
            deudas.forEach((deuda, index) => {
                const deudaElement = document.createElement('div');
                deudaElement.classList.add('debt-container');

                const montoTotal = typeof deuda.montoTotal === 'number' ? deuda.montoTotal : 0;
                const abonado = typeof deuda.abonado === 'number' ? deuda.abonado : 0;
                const saldoPendiente = Math.max(montoTotal - abonado, 0);

                deudaElement.innerHTML = `
                    <div class="debt-name">${deuda.nombre}</div>
                    <div class="debt-details">
                        <span class="debt-description">${deuda.descripcion}</span></p>
                        <hr class="separadores">
                        <p><strong>Deuda Total:</strong><br><span class="debt-amount">$${montoTotal.toFixed(2)}</span></p>
                        <p><strong>Abonado:</strong><br> <span class="debt-amount">$${abonado.toFixed(2)}</span></p>
                        <p><strong>Pendiente:</strong><br> <span class="debt-amount amnt-pending">$${saldoPendiente.toFixed(2)}</span></p>
                    </div>
                    <hr class="separadores">
                    <div class="debt-actions">
                        <button class="btn btn-primary" onclick="abonarDeuda(${index})" data-toggle="modal" data-target="#abonarModal">Abonar</button>
                    </div>
                `;

                debtListContainer.appendChild(deudaElement);

                if (abonado >= montoTotal) {
                    // No mostramos la deuda si está completamente saldada
                    deudaElement.style.display = 'none';
                }
            });
        }
    }

    function actualizarTotalDeudas() {
        const totalDeudasElement = document.getElementById('totalDeudas');

        // Calcula el total sumando los montos de todas las deudas
        const totalDeudas = deudas.reduce((total, deuda) => total + (deuda.montoTotal - deuda.abonado), 0);

        // Actualiza el contenido del elemento HTML
        totalDeudasElement.textContent = totalDeudas.toFixed(2);
    }

    // Al cargar la página, muestra las deudas
    mostrarDeudas();
});

// Notificacion de Agregar, Abonar y Warnings
function mostrarNotificacion(tipo, mensaje) {
    // Elimina notificaciones existentes
    $('.alert').remove();

    // Crea la notificación
    const alerta = $(`
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
`);

    // Agrega la notificación al contenedor de notificaciones
    $('#alertContainer').append(alerta);

    // Desaparece la notificación después de 3 segundos
    setTimeout(() => {
        alerta.alert('close');
    }, 2000);
}
//-----------------------------------------------






//-----------------------------------------------
// Iniciar AOSAnimation
//-----------------------------------------------
AOS.init({
    easing: 'ease-out-back', duration: 2000
})
//-----------------------------------------------