const contenedorTemp = document.querySelector(".contenedor-temp");
let input;
let btnCrear;
let btnEliminar;
let ejecucion;


function setStorage(tiempoLimite) {
    localStorage.setItem("tiempoLimite", tiempoLimite);
}

function getStorage() {
    return localStorage.getItem("tiempoLimite");
}

function removeStorage() {
    localStorage.removeItem("tiempoLimite");
}


class Temporizador {
    constructor( tiempoRestante ) {
        this.tiempoRestante = tiempoRestante;
    }

    ejecutar() {

        let { horasRestantes, minutosRestantes, segundosRestantes } = this.tiempoRestante;

        horasRestantes = parseInt(horasRestantes);
        minutosRestantes = parseInt(minutosRestantes);
        segundosRestantes = parseInt(segundosRestantes);
    
        ejecucion = setInterval(() => {

            if(segundosRestantes === 0){

                if(minutosRestantes > 0) {
                    minutosRestantes--;
                    segundosRestantes = 60;

                } else if(horasRestantes > 0) {
                    horasRestantes--;
                    minutosRestantes = 59;
                    segundosRestantes = 60;
                }
            }

            segundosRestantes--;

            if(segundosRestantes === 0 && minutosRestantes === 0 && horasRestantes === 0) {
                clearInterval(ejecucion);
                this.tiempoRestante = {};
                ui.cambiarContenedor(false);
                removeStorage();
            }
            
            this.tiempoRestante = { horasRestantes, minutosRestantes, segundosRestantes };
            
            ui.mostrarTiempo( this.tiempoRestante );

        }, 1000);
    }
}

class UI {
    cambiarContenedor(cambiarATemp) {

        let div;

        if(cambiarATemp) {
            div = document.querySelector(".contenedor-principal");
            if(div !== null) div.remove();

            const hora = getStorage();
            const divSecundario = document.createElement("DIV");
            divSecundario.classList.add("contenedor", "contenedor-secundario");
            divSecundario.innerHTML = `
                <div>
                    <div class="temporizador">
                        <span class="horas">00</span> : 
                        <span class="minutos">00</span> : 
                        <span class="segundos">00</span>
                    </div>
                    <p class="hora">Para las ${hora}</p>
                </div>
                <div class="centrar-contenido">
                    <button class="btn-eliminar">X</button>
                </div>
            `;
            contenedorTemp.appendChild(divSecundario);
            
            btnEliminar = document.querySelector(".btn-eliminar");
            btnEliminar.addEventListener("click", eliminar);
        } else {
            div = document.querySelector(".contenedor-secundario");
            if(div !== null) div.remove();

            const divPrincipal = document.createElement("DIV");
            divPrincipal.classList.add("contenedor", "contenedor-principal");
            divPrincipal.innerHTML = `
                <input type="time" class="input-tiempo resetear-input">
                <div class="centrar-contenido">
                    <button class="btn-crear">Crear</button>
                </div>
            `;
            contenedorTemp.appendChild(divPrincipal);

            input = document.querySelector(".input-tiempo");
            btnCrear = document.querySelector(".btn-crear");
            btnCrear.addEventListener("click", evaluarInput);
        }
    }

    mostrarTiempo(tiempoRestante) {

        document.querySelector(".horas").textContent = tiempoRestante.horasRestantes.toString().padStart(2, "0");
        document.querySelector(".minutos").textContent = tiempoRestante.minutosRestantes.toString().padStart(2, "0");
        document.querySelector(".segundos").textContent = tiempoRestante.segundosRestantes.toString().padStart(2, "0");
    }

    imprimirMensaje(mensaje, tipo) {

        const div = document.createElement("DIV");
        div.classList.add("mensaje");

        if(tipo === "error") {
            div.classList.add("error");
        } else {
            div.classList.add("correcto");
        }

        div.textContent = mensaje;

        const contenedor = document.querySelector(".contenedor");
        contenedorTemp.insertBefore(div, contenedor);

        setTimeout(() => {
            div.remove();
        }, 3000);
    }
}

let temporizador;
const ui = new UI();

document.addEventListener("DOMContentLoaded", () => {

    const hora = getStorage();

    if(hora !== null) {
        ejecutarTemp( hora );
    } else {
        ui.cambiarContenedor(false);
    }
});


function eliminar() {
    clearInterval( ejecucion );
    ui.cambiarContenedor(false);
    removeStorage();
}

function evaluarInput() {

    if( input.value === "" ) {
        ui.imprimirMensaje("El campo está vacío", "error");

        return;
    }

    ejecutarTemp( input.value );
}

function ejecutarTemp(tiempoLimite) {

    const horasLimite = sacarUnidad(tiempoLimite, "hora");
    const minutosLimite = sacarUnidad(tiempoLimite, "minutos");

    const tiempoRestante = evaluarTiempo(horasLimite, minutosLimite);

    temporizador = new Temporizador(tiempoRestante);

    if(temporizador.tiempoRestante !== undefined) {
        setStorage(tiempoLimite);

        ui.cambiarContenedor(true);
        ui.mostrarTiempo(temporizador.tiempoRestante);
        temporizador.ejecutar();
    }
}

function evaluarTiempo(horasLimite, minutosLimite) {
    const tiempoActual = new Date();
    const horasActual = tiempoActual.getHours();
    const minutosActual = tiempoActual.getMinutes();

    // Evaluar si el tiempo actual no se ha pasado del límite
    if( (horasActual >= horasLimite && minutosActual >= minutosLimite && getStorage() !== null && horasLimite != 0) || (horasLimite == 0 && horasActual == 0 && minutosActual >= minutosLimite) ) {
        removeStorage();
        ui.cambiarContenedor(false);
        return;
    }

    let horasRestantes = horasLimite - horasActual;
    let minutosRestantes = minutosLimite - minutosActual;
    
    if(horasRestantes > 0 && minutosRestantes < 0) minutosRestantes += 60;

    if(horasRestantes !== 1 && minutosRestantes !== 1) {
        if(horasRestantes > 0 && minutosRestantes > 0) horasRestantes--;
    } else if(horasRestantes === 1 && minutosLimite < minutosActual) {
        horasRestantes--;
    }

    if(minutosRestantes === 0 && horasRestantes > 0) {
        horasRestantes--;
        minutosRestantes += 59;
    } else if(horasRestantes === 0 && minutosRestantes > 0) {
        minutosRestantes--;
    }

    const segundosRestantes = 60 - tiempoActual.getSeconds();

    if(horasLimite == 0 && minutosLimite <= 0 && horasLimite < horasActual) {
        horasRestantes += 23;
        minutosRestantes += 59;
    } else if(horasRestantes < 0 || (horasRestantes === 0 && minutosRestantes < 0)) {
        ui.imprimirMensaje("Pon una hora mayor al de ahora", "error");
        return;
    }
    if(horasLimite == horasActual && minutosLimite == minutosActual) {
        ui.imprimirMensaje("El tiempo límite no puede ser igual al actual", "error");
        return;
    }

    const tiempoRestante = { horasRestantes, minutosRestantes, segundosRestantes };
    return tiempoRestante;
}

function sacarUnidad(tiempoLimite, unidad) {

    let inicio;
    let final
    if(unidad === "hora") {
        inicio = 0;
        final = 1;
    } else {
        inicio = 3;
        final = 4;
    }

    let tiempo = "";

    for(let i = inicio; i <= final; i++) {
        tiempo += tiempoLimite[i];
    }

    return tiempo;
}