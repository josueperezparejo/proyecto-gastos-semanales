// Variables y Selectores
const formulario = document.getElementById('agregar-gasto');
const gastosListado = document.querySelector('#gastos ul');
const btnNewPresupuesto = document.querySelector('#new-presupuesto');

// Eventos
eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);
    gastosListado.addEventListener('click', eliminarGasto);
    btnNewPresupuesto.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.reload()
    })
};

// Classes
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    };

    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    };

    eliminarGasto(id) {
        this.gastos = this.gastos.filter((gasto) => gasto.id.toString() !== id);
        this.calcularRestante();
    };

    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    };
};

class UI {

    insertarPresupuesto(cantidad) {
        document.querySelector('#total').textContent = cantidad.presupuesto;
        document.querySelector('#restante').textContent = cantidad.restante;
    };

    imprimirAlerta(mensaje, tipo) {
        const alerta = document.querySelector('.alert-active');
        if (!alerta) {
            const divMensaje = document.createElement('div');
            divMensaje.classList.add('text-center', 'alert', 'alert-active');

            if (tipo === 'error') {
                divMensaje.classList.add('alert-danger');
            } else {
                divMensaje.classList.add('alert-success');
            }

            divMensaje.textContent = mensaje;

            document.querySelector('.primario').insertBefore(divMensaje, formulario);

            setTimeout(() => {
                document.querySelector('.primario .alert').remove();
            }, 3000);
        }
    };

    agregarGastoListado(gastos) {

        this.limpiarHTML();

        gastos.forEach((gasto) => {
            const { nombre, cantidad, id } = gasto;

            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;

            nuevoGasto.innerHTML = ` ${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad}</span>`;

            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.textContent = 'Borrar';
            nuevoGasto.appendChild(btnBorrar);

            gastosListado.appendChild(nuevoGasto);
        })
    };

    actualizarRestante(restante) {
        document.querySelector('span#restante').textContent = restante;
    };

    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');

        if ((presupuesto / 4) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if ((presupuesto / 2) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-danger');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        if (restante <= 0) {

            setTimeout(() => {
                Swal.fire({
                    position: 'center',
                    icon: 'warning',
                    title: 'Presupuesto Agotado',
                    showConfirmButton: false,
                    timer: 2000
                })
            }, 1000);

            formulario.querySelector('button[type="submit"]').disabled = true;
        } else {
            formulario.querySelector('button[type="submit"]').disabled = false;
        }
    };

    limpiarHTML() {
        while (gastosListado.firstChild) {
            gastosListado.removeChild(gastosListado.firstChild);
        }
    };
};

const ui = new UI();
let presupuesto;

function preguntarPresupuesto() {

    // SweetAlert 
    Swal.fire({
        title: '¿Cual es tu Presupuesto?',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: false,
        showLoaderOnConfirm: false,
        confirmButtonText: 'Aceptar',
        preConfirm: (cantidad) => {

            const presupuestoUsuario = cantidad;
            if (presupuestoUsuario === '' || presupuestoUsuario === undefined || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
                Swal.showValidationMessage( `Presupuesto No Valido` )
            }

            presupuesto = new Presupuesto(presupuestoUsuario);
            ui.insertarPresupuesto(presupuesto)
        },
        allowOutsideClick: (cantidad) => {
            const presupuestoUsuario = cantidad;
            if (presupuestoUsuario === '' || presupuestoUsuario === undefined || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
                window.location.reload();
            }
            !Swal.isLoading()
        },
        allowEscapeKey: () => {
            const presupuestoUsuario = cantidad;
            if (presupuestoUsuario === '' || presupuestoUsuario === undefined || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
                window.location.reload();
            }

            return true
        }
    })
};


function agregarGasto(event) {
    event.preventDefault();

    const { restante } = presupuesto;
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    if (nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Todos los Campos son Obligatorios', 'error');
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('Cantidad No Válida', 'error');
    } else if (cantidad > restante) {
        ui.imprimirAlerta('Fondos Insuficientes', 'error');
    } else {
        const gasto = { nombre, cantidad, id: Date.now() };

        presupuesto.nuevoGasto(gasto);

        ui.imprimirAlerta('Agregado Correctamente', 'correcto');

        const { gastos } = presupuesto;

        ui.agregarGastoListado(gastos);

        ui.comprobarPresupuesto(presupuesto);

        const { restante } = presupuesto;

        ui.actualizarRestante(restante);

        formulario.reset();
    }
};

function eliminarGasto(event) {
    if (event.target.classList.contains('borrar-gasto')) {

        // sweetalert
        Swal.fire({
            title: 'Estas Seguro?',
            text: "No podras recuperarlo!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Eliminarlo!'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Eliminado!',
                    'Eliminado Correctamente.',
                    'success'
                )

                const { id } = event.target.parentElement.dataset;

                presupuesto.eliminarGasto(id);
                ui.comprobarPresupuesto(presupuesto);

                const { restante } = presupuesto;
                ui.actualizarRestante(restante);

                event.target.parentElement.remove();
            }
        })
    }
};

