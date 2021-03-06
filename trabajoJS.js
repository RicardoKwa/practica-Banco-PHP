function saldo_cuenta(numeroCuenta) {

    let data = "numero_cuenta=" + numeroCuenta
    fetch("saldo.php", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data
    }).then(function (respuesta) {
        return respuesta.text()
    }).then(function (resp) {
        let rounded = Math.round((parseFloat(resp) + Number.EPSILON) * 100) / 100;
        if (Number.isNaN(rounded)) {
            rounded = 0
        }
        let saldo = document.getElementById("saldo")
        saldo.innerHTML = ""
        let span = document.createElement("span")
        span.innerHTML = "Saldo : " + rounded + " €"
        saldo.appendChild(span)
    })
}

function catch_numero() {
    let titulo = document.getElementById('titulo')
    let arr = titulo.innerHTML.split(' ');
    return arr[arr.length - 1]
}

function sig_cuenta() {
    event.preventDefault()
    let numero_cuenta = catch_numero()
    let data = "numero_cuenta=" + numero_cuenta
    fetch("siguiente.php", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data
    }).then(function (respuesta) {
        return respuesta.json()
    }).then(function (cuentas) {
        let sig_cuenta;
        for (let i = 0; i < cuentas.length; i++) {
            if (cuentas[i].num_cuenta == numero_cuenta) {
                if (i == cuentas.length - 1) {
                    sig_cuenta = cuentas[0].num_cuenta
                } else {
                    sig_cuenta = cuentas[i + 1].num_cuenta
                }
            }
        }
        crearOpcionesCuenta(sig_cuenta)()
        let zonaInfo = document.getElementById('zonaInfo')
        zonaInfo.innerHTML = ''


    })
}
function listar_mov() {
    event.preventDefault()
    let numero_cuenta = catch_numero()
    let data = "numero_cuenta=" + numero_cuenta
    fetch("listar.php", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data
    }).then(function (respuesta) {
        return respuesta.json()
    }).then(function (resp) {
        if (resp != "") {
            let tabla = document.createElement("table")
            tabla.setAttribute("id", "tabla-movimientos")
            let filaT = document.createElement("tr");
            let columnaT1 = document.createElement("th");
            let columnaT2 = document.createElement("th");
            let columnaT3 = document.createElement("th");

            columnaT1.innerHTML = "Tipo"
            columnaT2.innerHTML = "Cantidad(€)"
            columnaT3.innerHTML = "Fecha"

            filaT.appendChild(columnaT1)
            filaT.appendChild(columnaT2)
            filaT.appendChild(columnaT3)
            tabla.appendChild(filaT)

            resp.map(function (obj) {
                let fila = document.createElement("tr");
                let columna1 = document.createElement("td");
                let columna2 = document.createElement("td");
                let columna3 = document.createElement("td");

                columna1.innerHTML = obj['tipo_mov']
                columna2.innerHTML = obj['monto']
                columna3.innerHTML = obj['fecha']

                fila.appendChild(columna1)
                fila.appendChild(columna2)
                fila.appendChild(columna3)
                tabla.appendChild(fila)
            });

            let zonaInfo = document.getElementById("zonaInfo");
            zonaInfo.innerHTML = "";
            zonaInfo.appendChild(tabla);
        } else {
            alert("No hay movimientos")
            
        }
    })
}

function enviar_mov() {
    event.preventDefault();
    let numeroCuenta = catch_numero()
    let data
    if (document.getElementById('ingreso').checked) {
        data = {
            tipoMov: document.forms.registro_mov['ingreso'].value,
            importe: document.forms.registro_mov['importe'].value,
            cuenta: numeroCuenta
        }
    } else if (document.getElementById('reintegro').checked) {
        data = {
            tipoMov: document.forms.registro_mov['reintegro'].value,
            importe: document.forms.registro_mov['importe'].value,
            cuenta: numeroCuenta
        }
    }

    fetch("envio_mov.php", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (respuesta) {
        return respuesta.text()
    }).then(function (resp) {
        if (resp === "FALSE") {
            alert("ERROR EN EL REGISTRO");
        } else if (resp === "TRUE") {
            alert("CORRECTO")
            saldo_cuenta(numeroCuenta)
            balance_total();
        } else if (resp === "Negativo") {
            alert("Introduzca números positivos")
        }
    })

}


function crearFormReg() {//Crear formulario de registro de movimiento
    let numero_cuenta = catch_numero()

    let zonaInfo = document.getElementById("zonaInfo");
    zonaInfo.innerHTML = "";

    let formReg_mov = document.createElement("form");
    formReg_mov.setAttribute("id", "registro_mov");


    let titulo = document.createElement("h2");
    titulo.innerHTML = "Registro " + numero_cuenta;

    let p = document.createElement("p");
    p.innerHTML = "Selecciona el tipo";

    let input1 = document.createElement("input");
    input1.setAttribute("type", "radio");
    input1.setAttribute("name", "elegirTipo");
    input1.setAttribute("value", "Ingreso");
    input1.setAttribute("id", "ingreso");

    let label1 = document.createElement("label");
    label1.setAttribute("for", "ingreso");
    label1.innerHTML = "Ingreso";
    let mybr1 = document.createElement("BR");

    let input2 = document.createElement("input");
    input2.setAttribute("type", "radio");
    input2.setAttribute("name", "elegirTipo");
    input2.setAttribute("value", "Reintegro");
    input2.setAttribute("id", "reintegro");

    let label2 = document.createElement("label");
    label2.setAttribute("for", "reintegro");
    label2.innerHTML = "Reintegro";
    let mybr2 = document.createElement("BR");


    let label3 = document.createElement("label");
    label3.setAttribute("for", "importe")
    label3.innerHTML = "Importe";

    let input3 = document.createElement("input");
    input3.setAttribute("type", "number");
    input3.setAttribute("step", "0.01");
    input3.setAttribute("min", "0");
    input3.setAttribute("id", "importe");
    let mybr3 = document.createElement("BR");


    let enviar = document.createElement("input");
    enviar.setAttribute("type", "submit");
    enviar.setAttribute("value", "Enviar");
    enviar.setAttribute("id", "enviarMov");

    formReg_mov.appendChild(titulo);

    formReg_mov.appendChild(p);
    formReg_mov.appendChild(input1);
    formReg_mov.appendChild(label1);
    formReg_mov.appendChild(mybr1);

    formReg_mov.appendChild(input2);
    formReg_mov.appendChild(label2);
    formReg_mov.appendChild(mybr2);

    formReg_mov.appendChild(label3);
    formReg_mov.appendChild(input3);
    formReg_mov.appendChild(mybr3);

    formReg_mov.appendChild(enviar);
    enviar.addEventListener("click", enviar_mov)

    zonaInfo.appendChild(formReg_mov);
}


function crearOpcionesCuenta(numeroCuenta) {
    return function () {
        let movimientos = document.createElement("button");
        movimientos.innerHTML = "Registrar movimientos";
        let listar = document.createElement("button");
        listar.innerHTML = "Listar movimientos";
        let siguiente = document.createElement("button");
        siguiente.innerHTML = "Siguiente cuenta";

        movimientos.addEventListener("click", crearFormReg);
        listar.addEventListener("click", listar_mov);
        siguiente.addEventListener("click", sig_cuenta);

        let lista = document.getElementById("lista-botones");
        lista.innerHTML = '';

        let elem1 = document.createElement("li");
        elem1.appendChild(movimientos)
        lista.appendChild(elem1);
        let elem2 = document.createElement("li");
        elem2.appendChild(listar)
        lista.appendChild(elem2);
        let elem3 = document.createElement("li");
        elem3.appendChild(siguiente)
        lista.appendChild(elem3);

        let titulo = document.getElementById("titulo");
        titulo.innerHTML = "Opciones Cuenta : " + numeroCuenta;

        saldo_cuenta(numeroCuenta)
    }
}

function form_new_cuenta() {
    event.preventDefault()
    let zonaInfo = document.getElementById("zonaInfo");
    zonaInfo.innerHTML = "";

    let formNew_ac = document.createElement("form");
    formNew_ac.setAttribute("id", "new_cuenta");

    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Nuevo numero de cuenta");
    input.setAttribute("name", "new_numero");
    input.setAttribute("id", "new_numero");
    input.setAttribute("maxlength", "10");
    let mybr = document.createElement("BR");

    let enviar = document.createElement("input");
    enviar.setAttribute("type", "submit");
    enviar.setAttribute("value", "Enviar");
    enviar.setAttribute("id", "env_numero");


    formNew_ac.appendChild(input);
    formNew_ac.appendChild(mybr);
    formNew_ac.appendChild(enviar);

    enviar.addEventListener("click", new_cuenta)

    zonaInfo.appendChild(formNew_ac);
}

function new_cuenta() {
    event.preventDefault()
    let numero = document.getElementById('new_numero').value
    if (confirm("¿Quieres crear una nueva Cuenta?")) {
        if (Number.isInteger(parseInt(numero)) && numero.length == 10 || numero == "") {
            let data = "numero_cuenta=" + numero
            fetch("nueva_cuenta.php", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: data
            })
                .then(function (respuesta) {
                    return respuesta.text()
                }).then(function (text) {
                    if (text == "FALSE") {
                        alert("Error al crear nueva Cuenta");
                    } else if (text == "MAX") {
                        alert("Máximo de cuentas alcanzado (5)");
                    } else {
                        alert("Nueva Cuenta creada correctamente")
                        document.getElementById('zonaInfo').innerHTML = "";
                        numero.value = ""
                        cargarCuentas(text, true)();
                    }
                })
        } else alert("Introduce 10 numeros en IBAN")
    }
}

function crearAddCuenta() {
    let div = document.createElement("div")
    div.setAttribute('id', 'add-cuenta')
    let btn = document.createElement("button");
    btn.innerHTML = 'Crear nueva cuenta';
    btn.addEventListener('click', form_new_cuenta);
    div.appendChild(btn);
    return div;

}

function crearBotonCuenta(numeroCuenta, compartida, indice) {
    indice = indice + 1;//Le sumo 1 para que los indices empiecen desde el 1 no el 0
    let btn = document.createElement("button");
    if (compartida == 1) {
        btn.innerHTML = "Cuenta *Compartida " + indice + " : " + numeroCuenta;
    } else {
        btn.innerHTML = "Cuenta " + indice + " : " + numeroCuenta;
    }
    btn.addEventListener("click", crearOpcionesCuenta(numeroCuenta));
    return btn;
}

function cargarCuentas(email, cargaCabecera) {
    return function () {
        let data = "email=" + email;

        fetch("cuentas_json.php", {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data
        })
            .then(function (respuesta) {
                return respuesta.json()
            }).then(function (cuentas) {
                let titulo = document.getElementById("titulo");
                let contenido = document.getElementById("contenido");
                contenido.innerHTML = "";
                titulo.innerHTML = "Cuentas Bancarias";
                if (cuentas != "") {
                    let lista = document.createElement("ul");
                    lista.setAttribute("id", "lista-botones")
                    for (let i = 0; i < cuentas.length; i++) {
                        let elem = document.createElement("li");
                        boton = crearBotonCuenta(cuentas[i].num_cuenta, cuentas[i].compartida, i);
                        elem.appendChild(boton);
                        lista.appendChild(elem);
                    }
                    contenido.appendChild(lista);

                } else {
                    let nada = document.createElement("h2");
                    nada.innerHTML = "NO HAY CUENTAS BANCARIAS"
                    contenido.appendChild(nada)
                }
                document.getElementById('nueva_cuenta').innerHTML = "";
                document.getElementById('zonaInfo').innerHTML = "";
                document.getElementById('saldo').innerHTML = "";
                document.getElementById('nueva_cuenta').appendChild(crearAddCuenta());
                if (cargaCabecera != "true") { load_header() }

            })
    }
}

function cerrarSesionUnaPagina(cabecera) {/*cerrar sesión*/
    let close = document.getElementById('cerrar_sesion');
    close.addEventListener("click", function (e) {
        e.preventDefault()
        if (confirm("¿Quieres Cerrar Sesión?")) {
            fetch("logout.php")
                .then(function (respuesta) {
                    return respuesta.text()
                }).then(function (text) {
                    cabecera.style.display = "none";
                    document.getElementById("contenido").innerHTML = "";
                    document.getElementById("principal").style.display = "none";
                    document.getElementById("botones_inicio").style.display = "flex";
                    location.reload()
                })
        }
    })
}

function home_header(email, cabecera) {

    let child_header = cabecera.children
    child_header[2].addEventListener("click", cargarCuentas(email, "true"))
    cerrarSesionUnaPagina(cabecera)
}

function load_header() {
    let cabecera = document.getElementById('cabecera');
    cabecera.style.display = "flex";
    fetch("cargar_usuario.php")
        .then(function (respuesta) {
            return respuesta.text()
        }).then(function (text) {
            document.getElementById('cab_usuario').innerHTML = "Usuario : " + text;
            balance_total();
            home_header(text, cabecera);
        })
}

function balance_total() {

    fetch("balance_total.php")
        .then(function (respuesta) {
            return respuesta.text()
        }).then(function (resp) {
            let rounded
            if (resp != "FALSE") {
                rounded = Math.round((parseFloat(resp) + Number.EPSILON) * 100) / 100;
                if (Number.isNaN(rounded)) {
                    rounded = 0
                }
            } else {
                rounded = 0
            }
            document.getElementById('balance').innerHTML = "Tu Dinero : " + rounded + " €"
        })
}

function validarEmail(valor) {
    if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(valor)) {
        return true
    } else {
        return false
    }
}
function register() {

    event.preventDefault()
    let nombre = document.forms.formularioReg['nombre'].value
    let p_apellido = document.forms.formularioReg['p-apellido'].value
    let s_apellido = document.forms.formularioReg['s-apellido'].value
    let email = document.forms.formularioReg['emailR'].value
    let clave = document.forms.formularioReg['pswR-repeat'].value
    let iban = document.forms.formularioReg['iban'].value

    let data = {
        nombre: nombre,
        papellido: p_apellido,
        sapellido: s_apellido,
        email: email,
        clave: clave,
        cuenta: iban
    }

    if (validarEmail(email)) {
        if (nombre != "" && p_apellido != "" && s_apellido != "" && email != "" && clave != "") {
            if (Number.isInteger(parseInt(iban)) && iban.length == 10 || iban == "") {
                if (clave == document.forms.formularioReg['pswR'].value) {
                    fetch("registro.php", {
                        method: "POST",
                        body: JSON.stringify(data),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(function (respuesta) {
                        return respuesta.text()
                    }).then(function (text) {
                        if (text === "FALSE") {
                            alert("Error en el registro");
                        } else {
                            document.getElementById("principal").style.display = "flex";
                            document.getElementById("formularioReg").style.display = "none";
                            cargarCuentas(email)();
                        }
                    })

                } else {
                    alert("Las contraseñas no coinciden")
                }

            } else {
                alert("Introduce 10 numeros en IBAN")
            }
        } else {
            alert("Campos requeridos sin rellenar")
        }
    } else {
        alert("Email incorrecto")
    }
}

function login() {
    event.preventDefault()
    let email = document.forms.formularioLog['email'].value
    let clave = document.forms.formularioLog['psw'].value

    data = {
        email: email,
        clave: clave
    }
    fetch("login.php", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(function (respuesta) {
            return respuesta.text()
        }).then(function (text) {
            if (text === "FALSE") {
                alert("Revise usuario y contraseña");
            } else {
                document.getElementById("principal").style.display = "flex";
                document.getElementById("formularioLog").style.display = "none";
                cargarCuentas(email)();
            }
        })
}



function formRegistroBlock() {
    document.getElementById("formularioReg").style.display = "flex";
    document.getElementById("botones_inicio").style.display = "none";
    document.getElementById("enviarRegistro").addEventListener("click", register)
}

function formLoginBlock() {
    document.getElementById("formularioLog").style.display = "flex";
    document.getElementById("botones_inicio").style.display = "none";
    document.getElementById("enviarLogin").addEventListener("click", login)



}

window.addEventListener("load", function init() {

    document.getElementById("registro_nuevo").addEventListener("click", formRegistroBlock)
    document.getElementById("login").addEventListener("click", formLoginBlock)


})


