document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     FUNCIONES GENERALES
  ========================= */

  function formatoCLP(valor) {
    return "$" + Math.round(valor).toLocaleString("es-CL") + " CLP";
  }

  function leerJSON(clave, valorDefecto) {
    const dato = localStorage.getItem(clave);

    if (!dato) {
      return valorDefecto;
    }

    try {
      return JSON.parse(dato);
    } catch {
      return valorDefecto;
    }
  }

  function guardarJSON(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }


  /* =========================
     PRODUCTOS
  ========================= */

  const productos = [
    {
      id: 1,
      nombre: "Mojito Virgen Exótico",
      descripcion: "Lima, hierbabuena, soda y frutas tropicales.",
      precio: 3500,
      stock: 10,
      foto: "img/mojito.jpg"
    },
    {
      id: 2,
      nombre: "Piña Colada Zero",
      descripcion: "Piña, coco y una combinación tropical sin alcohol.",
      precio: 4000,
      stock: 8,
      foto: "img/piñacolada.jfif"
    },
    {
      id: 5,
      nombre: "Mango Passion",
      descripcion: "Mango, maracuyá y un delicado toque cítrico.",
      precio: 4500,
      stock: 9,
      foto: "img/mango-passion.jpg"
    },
    {
      id: 3,
      nombre: "Primavera Cítrica",
      descripcion: "Naranja, limón y frutas frescas.",
      precio: 3000,
      stock: 12,
      foto: "img/primera.jfif"
    },
    {
      id: 4,
      nombre: "Frutos Rojos Fizz",
      descripcion: "Frutilla, frambuesa, arándanos y soda.",
      precio: 4200,
      stock: 10,
      foto: "img/frutos-rojos.jpg"
    },
    {
      id: 6,
      nombre: "Blue Citrus",
      descripcion: "Limón, naranja, menta y jarabe azul sin alcohol.",
      precio: 3800,
      stock: 11,
      foto: "img/blue-citrus.jpg"
    }
  ];


  /* =========================
     STOCK
  ========================= */

  function obtenerStock() {
    const guardado = leerJSON("stockMocktails", null);

    if (guardado) {
      productos.forEach((producto) => {
        if (guardado[producto.id] === undefined) {
          guardado[producto.id] = producto.stock;
        }
      });

      guardarJSON("stockMocktails", guardado);
      return guardado;
    }

    const inicial = {};

    productos.forEach((producto) => {
      inicial[producto.id] = producto.stock;
    });

    guardarJSON("stockMocktails", inicial);

    return inicial;
  }

  let stockActual = obtenerStock();

  function guardarStock() {
    guardarJSON("stockMocktails", stockActual);
  }


  /* =========================
     BARRA DE ESTADO
  ========================= */

  function actualizarBarraEstado() {
    const barra = document.getElementById("barra-estado");

    if (!barra) {
      return;
    }

    const adminActivo =
      localStorage.getItem("sesionAdmin") === "activa";

    if (adminActivo) {
      barra.textContent = "Bienvenido, Administrador";
      barra.style.color = "#32CD32";
      barra.style.fontWeight = "bold";
      return;
    }

    const reservas = leerJSON("pedidosMocktails", []);

    const pendientes = reservas.filter(
      (reserva) => reserva.estado === "Pendiente"
    );

    if (pendientes.length > 0) {
      barra.textContent =
        "Tienes " +
        pendientes.length +
        " reserva(s) pendiente(s)";

      barra.style.color = "#FFD700";
      barra.style.fontWeight = "bold";
    } else {
      barra.textContent = "";
    }
  }


  /* =========================
     NOTIFICACIÓN CLIENTE
  ========================= */

  function panelAdminVisible() {
    const panel = document.getElementById("panel-admin");

    return (
      panel &&
      getComputedStyle(panel).display !== "none"
    );
  }

  function guardarNotificacionReserva(reserva) {
    const notificaciones = leerJSON(
      "notificacionesReservaCliente",
      []
    );

    notificaciones.push({
      id: Date.now(),
      reservaId: reserva.reservaId,
      producto: reserva.producto,
      cantidad: reserva.cantidad,
      total: reserva.total,
      fecha: new Date().toLocaleString("es-CL"),
      leida: false
    });

    guardarJSON(
      "notificacionesReservaCliente",
      notificaciones
    );
  }

  function mostrarNotificacionReserva() {
    if (panelAdminVisible()) {
      return;
    }

    const existente = document.getElementById(
      "notificacion-reserva-cliente"
    );

    if (existente) {
      return;
    }

    const notificaciones = leerJSON(
      "notificacionesReservaCliente",
      []
    );

    const pendiente = notificaciones.find(
      (item) => item.leida === false
    );

    if (!pendiente) {
      return;
    }

    const contenedor = document.createElement("div");

    contenedor.id = "notificacion-reserva-cliente";

    contenedor.innerHTML = `
      <div class="notificacion-reserva-contenido">

        <div class="notificacion-icono">
          ✓
        </div>

        <div class="notificacion-texto">

          <h3>
            ¡Reserva confirmada!
          </h3>

          <p>
            Tu reserva de
            <strong>
              ${pendiente.cantidad} × ${pendiente.producto}
            </strong>
            fue aceptada con éxito.
          </p>

          <p class="notificacion-codigo">
            Código: #${pendiente.reservaId}
            · Total: ${formatoCLP(pendiente.total)}
          </p>

        </div>

        <button
          type="button"
          id="cerrar-notificacion-reserva"
        >
          Entendido
        </button>

      </div>
    `;

    document.body.appendChild(contenedor);

    document
      .getElementById("cerrar-notificacion-reserva")
      .addEventListener("click", () => {

        const actualizadas = leerJSON(
          "notificacionesReservaCliente",
          []
        );

        const encontrada = actualizadas.find(
          (item) => item.id === pendiente.id
        );

        if (encontrada) {
          encontrada.leida = true;
        }

        guardarJSON(
          "notificacionesReservaCliente",
          actualizadas
        );

        contenedor.remove();

        setTimeout(
          mostrarNotificacionReserva,
          150
        );
      });
  }


  /* =========================
     NOSOTROS
  ========================= */

  const equipoContainer =
    document.getElementById("equipo-container");

  if (equipoContainer) {

    const equipo = [
      {
        nombre: "Sofia Hernandez",
        rol: "Fundadora y Mixóloga Principal",
        descripcion:
          "Especialista en creación de infusiones artesanales y combinaciones de frutas exóticas.",
        foto: "img/sofia.jpg"
      },
      {
        nombre: "Sammy Valencia",
        rol: "Co-Fundador y Bartender Senior",
        descripcion:
          "Especialista en técnicas de agitado en coctelera y preparación de tragos ahumados sin alcohol.",
        foto: "img/sammy.jpg"
      },
      {
        nombre: "Arantza Bohorquez",
        rol: "Especialista en Experiencia",
        descripcion:
          "Especialista en montaje estético de la barra y decoración visual de cada bebida.",
        foto: "img/arantza.jpg"
      }
    ];

    let tarjetas = "";

    equipo.forEach((miembro) => {

      tarjetas += `
        <article class="tarjeta integrante-card">

          <img
            src="${miembro.foto}"
            alt="${miembro.nombre}"
            class="integrante-foto"
          >

          <div class="integrante-info">

            <h3>
              ${miembro.nombre}
            </h3>

            <h4>
              ${miembro.rol}
            </h4>

            <p>
              ${miembro.descripcion}
            </p>

          </div>

        </article>
      `;
    });

    equipoContainer.innerHTML = tarjetas;
  }


  /* =========================
     SERVICIOS
  ========================= */

  const catalogoContainer =
    document.getElementById("catalogo-container");

  const resumenReservas =
    document.getElementById("resumen-reservas");


  /* =========================
     RESUMEN CLIENTE
  ========================= */

  function mostrarResumenReservas() {
    if (!resumenReservas) {
      return;
    }

    const reservas = leerJSON(
      "pedidosMocktails",
      []
    );

    const pendientes = reservas.filter(
      (reserva) =>
        reserva.estado === "Pendiente"
    );

    if (pendientes.length === 0) {

      resumenReservas.innerHTML = `
        <article class="tarjeta">

          <h3>
            Tus reservas
          </h3>

          <p>
            No tienes reservas pendientes.
          </p>

        </article>
      `;

      return;
    }

    let reservasHTML = "";

    pendientes.forEach((reserva) => {

      reservasHTML += `
        <div class="reserva-cliente">

          <div class="reserva-cliente-info">

            <h4>
              ${reserva.producto}
            </h4>

            <p>
              Cantidad:
              <strong>
                ${reserva.cantidad}
              </strong>
            </p>

            <p>
              Total:
              <strong>
                ${formatoCLP(reserva.total)}
              </strong>
            </p>

            <p class="codigo-reserva">
              Código: #${reserva.reservaId}
            </p>

            <p class="estado-pendiente">
              Estado: Pendiente
            </p>

          </div>

          <button
            type="button"
            class="btn-cancelar-reserva-cliente"
            data-id="${reserva.reservaId}"
          >
            Cancelar reserva
          </button>

        </div>
      `;
    });

    resumenReservas.innerHTML = `
      <article class="tarjeta">

        <h3>
          Tus reservas pendientes
        </h3>

        <p class="texto-reservas">
          Puedes cancelar una reserva
          mientras todavía esté pendiente.
        </p>

        <div class="lista-reservas-cliente">
          ${reservasHTML}
        </div>

      </article>
    `;

    document
      .querySelectorAll(
        ".btn-cancelar-reserva-cliente"
      )
      .forEach((boton) => {

        boton.addEventListener(
          "click",
          () => {

            cancelarReservaCliente(
              Number(boton.dataset.id)
            );

          }
        );
      });
  }


  /* =========================
     CANCELAR RESERVA CLIENTE
  ========================= */

  function cancelarReservaCliente(id) {
    const reservas = leerJSON(
      "pedidosMocktails",
      []
    );

    const reserva = reservas.find(
      (item) => item.reservaId === id
    );

    if (
      !reserva ||
      reserva.estado !== "Pendiente"
    ) {
      return;
    }

    reserva.estado = "Cancelada";

    stockActual[reserva.productoId] =
      (
        stockActual[reserva.productoId] || 0
      ) + reserva.cantidad;

    guardarStock();

    guardarJSON(
      "pedidosMocktails",
      reservas
    );

    actualizarBarraEstado();

    renderCatalogo();
  }


  /* =========================
     CREAR RESERVA
  ========================= */

  function reservarProducto(index) {
    const producto = productos[index];

    const cantidadInput =
      document.getElementById(
        "cantidad-" + producto.id
      );

    const mensaje =
      document.getElementById(
        "mensaje-" + producto.id
      );

    if (!cantidadInput || !mensaje) {
      return;
    }

    mensaje.textContent = "";

    const cantidadTexto =
      cantidadInput.value.trim();

    if (cantidadTexto === "") {
      mensaje.textContent =
        "Debes ingresar una cantidad.";

      mensaje.style.color =
        "#ff4d4d";

      return;
    }

    const cantidad =
      Number(cantidadTexto);

    if (
      isNaN(cantidad) ||
      cantidad <= 0 ||
      !Number.isInteger(cantidad)
    ) {
      mensaje.textContent =
        "Ingresa una cantidad válida.";

      mensaje.style.color =
        "#ff4d4d";

      return;
    }

    const disponible =
      stockActual[producto.id];

    if (cantidad > disponible) {
      mensaje.textContent =
        "No hay suficiente stock.";

      mensaje.style.color =
        "#ff4d4d";

      return;
    }

    stockActual[producto.id] =
      disponible - cantidad;

    guardarStock();

    const reservas = leerJSON(
      "pedidosMocktails",
      []
    );

    const nuevaReserva = {
      reservaId: Date.now(),
      productoId: producto.id,
      producto: producto.nombre,
      cantidad: cantidad,
      precioUnitario: producto.precio,
      total: producto.precio * cantidad,
      fecha: new Date().toLocaleString("es-CL"),
      estado: "Pendiente"
    };

    reservas.push(nuevaReserva);

    guardarJSON(
      "pedidosMocktails",
      reservas
    );

    actualizarBarraEstado();

    renderCatalogo();
  }


  /* =========================
     MOSTRAR CATÁLOGO
  ========================= */

  function renderCatalogo() {
    if (!catalogoContainer) {
      return;
    }

    let html = "";

    productos.forEach(
      (producto, index) => {

        const stock =
          stockActual[producto.id];

        const agotado =
          stock <= 0;

        html += `
          <article class="tarjeta">

            <div class="producto-imagen">

              <img
                src="${producto.foto}"
                alt="${producto.nombre}"
              >

            </div>

            <div class="producto-info">

              <h3>
                ${producto.nombre}
              </h3>

              <p>
                ${producto.descripcion}
              </p>

              <p>
                <strong>
                  ${formatoCLP(producto.precio)}
                </strong>
              </p>

              <p>
                Stock disponible:
                <strong>
                  ${stock}
                </strong>
              </p>

              <label
                for="cantidad-${producto.id}"
              >
                <strong>
                  Cantidad
                </strong>
              </label>

              <div class="producto-acciones">

                <input
                  type="number"
                  id="cantidad-${producto.id}"
                  value="${agotado ? 0 : 1}"
                  min="${agotado ? 0 : 1}"
                  max="${stock}"
                  ${agotado ? "disabled" : ""}
                >

                <button
                  type="button"
                  class="btn-cta btn-reservar"
                  data-index="${index}"
                  ${agotado ? "disabled" : ""}
                >
                  ${
                    agotado
                      ? "Agotado"
                      : "Reservar"
                  }
                </button>

              </div>

              <div
                id="mensaje-${producto.id}"
                class="mensaje-producto"
              ></div>

            </div>

          </article>
        `;
      }
    );

    catalogoContainer.innerHTML = html;

    document
      .querySelectorAll(".btn-reservar")
      .forEach((boton) => {

        boton.addEventListener(
          "click",
          () => {

            reservarProducto(
              Number(boton.dataset.index)
            );

          }
        );
      });

    mostrarResumenReservas();
  }

  if (catalogoContainer) {
    renderCatalogo();
  }


  /* =========================
     CONTACTO
  ========================= */

  const contactoForm =
    document.getElementById("contacto-form");

  if (contactoForm) {

    contactoForm.addEventListener(
      "submit",
      (evento) => {

        evento.preventDefault();

        const telefono =
          document
            .getElementById("telefono")
            .value
            .trim();

        const mensaje =
          document
            .getElementById("mensaje")
            .value
            .trim();

        const error =
          document.getElementById(
            "error-msg"
          );

        error.textContent = "";
        error.style.color = "#ff4d4d";
        error.style.fontWeight = "bold";

        if (
          telefono === "" ||
          mensaje === ""
        ) {
          error.textContent =
            "Todos los campos son obligatorios.";

          return;
        }

        if (
          isNaN(Number(telefono))
        ) {
          error.textContent =
            "El teléfono solo puede contener números.";

          return;
        }

        if (
          telefono.length < 8 ||
          telefono.length > 12
        ) {
          error.textContent =
            "El teléfono debe tener entre 8 y 12 dígitos.";

          return;
        }

        if (mensaje.length < 10) {
          error.textContent =
            "El mensaje debe tener al menos 10 caracteres.";

          return;
        }

        if (mensaje.length > 300) {
          error.textContent =
            "El mensaje no puede superar los 300 caracteres.";

          return;
        }

        error.textContent =
          "Consulta enviada correctamente.";

        error.style.color =
          "#87CEEB";

        contactoForm.reset();
      }
    );
  }


  /* =========================
     LOGIN ADMINISTRADOR
  ========================= */

  const loginForm =
    document.getElementById("login-form");

  const panelAdmin =
    document.getElementById("panel-admin");


  function mostrarPanelAdmin() {
    const contacto =
      document.getElementById(
        "seccion-contacto"
      );

    const login =
      document.getElementById(
        "seccion-login"
      );

    if (contacto) {
      contacto.style.display = "none";
    }

    if (login) {
      login.style.display = "none";
    }

    if (!panelAdmin) {
      return;
    }

    const notificacionCliente =
      document.getElementById(
        "notificacion-reserva-cliente"
      );

    if (notificacionCliente) {
      notificacionCliente.remove();
    }

    panelAdmin.style.display = "block";

    panelAdmin.innerHTML = `
      <h2>
        Panel Administrativo
      </h2>

      <p class="texto-centro">
        Gestiona las reservas
        realizadas por los clientes.
      </p>

      <div
        id="contenido-reservas-admin"
      ></div>

      <div class="acciones-admin">

        <button
          type="button"
          id="cerrar-sesion"
          class="btn-cta"
        >
          Cerrar Sesión
        </button>

      </div>
    `;

    mostrarReservasAdmin();

    document
      .getElementById("cerrar-sesion")
      .addEventListener(
        "click",
        cerrarSesion
      );

    actualizarBarraEstado();
  }


  /* =========================
     RESERVAS ADMIN
  ========================= */

  function mostrarReservasAdmin() {
    const contenido =
      document.getElementById(
        "contenido-reservas-admin"
      );

    if (!contenido) {
      return;
    }

    const reservas = leerJSON(
      "pedidosMocktails",
      []
    );

    const pendientes =
      reservas.filter(
        (reserva) =>
          reserva.estado === "Pendiente"
      ).length;

    const aceptadas =
      reservas.filter(
        (reserva) =>
          reserva.estado === "Aceptada" ||
          reserva.estado === "Completada"
      ).length;

    const canceladas =
      reservas.filter(
        (reserva) =>
          reserva.estado === "Cancelada"
      ).length;

    const totalPendiente =
      reservas
        .filter(
          (reserva) =>
            reserva.estado === "Pendiente"
        )
        .reduce(
          (total, reserva) =>
            total + reserva.total,
          0
        );

    let filas = "";

    reservas.forEach((reserva) => {

      let estadoHTML = `
        <strong>
          ${reserva.estado}
        </strong>
      `;

      if (
        reserva.estado === "Pendiente"
      ) {

        estadoHTML = `
          <div class="estado-admin">

            <strong class="estado-pendiente-admin">
              Pendiente
            </strong>

            <div class="botones-estado">

              <button
                type="button"
                class="btn-completar"
                data-id="${reserva.reservaId}"
              >
                Aceptar
              </button>

              <button
                type="button"
                class="btn-cancelar"
                data-id="${reserva.reservaId}"
              >
                Cancelar
              </button>

            </div>

          </div>
        `;
      }

      filas += `
        <tr>

          <td>
            #${reserva.reservaId}
          </td>

          <td>
            ${reserva.producto}
          </td>

          <td>
            ${reserva.cantidad}
          </td>

          <td>
            ${formatoCLP(
              reserva.precioUnitario
            )}
          </td>

          <td>
            ${formatoCLP(
              reserva.total
            )}
          </td>

          <td>
            ${reserva.fecha}
          </td>

          <td>
            ${estadoHTML}
          </td>

        </tr>
      `;
    });

    if (reservas.length === 0) {

      filas = `
        <tr>
          <td colspan="7">
            No existen reservas registradas.
          </td>
        </tr>
      `;
    }

    contenido.innerHTML = `
      <article class="tarjeta">

        <h3>
          Gestión de reservas
        </h3>

        <div class="resumen-admin">

          <div>
            <strong>
              Pendientes
            </strong>
            <p>${pendientes}</p>
          </div>

          <div>
            <strong>
              Aceptadas
            </strong>
            <p>${aceptadas}</p>
          </div>

          <div>
            <strong>
              Canceladas
            </strong>
            <p>${canceladas}</p>
          </div>

          <div>
            <strong>
              Valor pendiente
            </strong>

            <p>
              ${formatoCLP(totalPendiente)}
            </p>
          </div>

        </div>

        <div class="tabla-responsive">

          <table>

            <thead>

              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>

            </thead>

            <tbody>
              ${filas}
            </tbody>

          </table>

        </div>

      </article>
    `;

    document
      .querySelectorAll(".btn-completar")
      .forEach((boton) => {

        boton.addEventListener(
          "click",
          () => {

            aceptarReserva(
              Number(boton.dataset.id)
            );

          }
        );
      });

    document
      .querySelectorAll(".btn-cancelar")
      .forEach((boton) => {

        boton.addEventListener(
          "click",
          () => {

            cancelarReservaAdmin(
              Number(boton.dataset.id)
            );

          }
        );
      });
  }


  /* =========================
     ACEPTAR RESERVA ADMIN
  ========================= */

  function aceptarReserva(id) {
    const reservas = leerJSON(
      "pedidosMocktails",
      []
    );

    const reserva = reservas.find(
      (item) =>
        item.reservaId === id
    );

    if (
      !reserva ||
      reserva.estado !== "Pendiente"
    ) {
      return;
    }

    reserva.estado = "Aceptada";

    guardarJSON(
      "pedidosMocktails",
      reservas
    );

    guardarNotificacionReserva(
      reserva
    );

    mostrarReservasAdmin();

    actualizarBarraEstado();
  }


  /* =========================
     CANCELAR RESERVA ADMIN
  ========================= */

  function cancelarReservaAdmin(id) {
    const reservas = leerJSON(
      "pedidosMocktails",
      []
    );

    const reserva = reservas.find(
      (item) =>
        item.reservaId === id
    );

    if (
      !reserva ||
      reserva.estado !== "Pendiente"
    ) {
      return;
    }

    reserva.estado = "Cancelada";

    stockActual[reserva.productoId] =
      (
        stockActual[
          reserva.productoId
        ] || 0
      ) + reserva.cantidad;

    guardarStock();

    guardarJSON(
      "pedidosMocktails",
      reservas
    );

    mostrarReservasAdmin();

    actualizarBarraEstado();
  }


  /* =========================
     CERRAR SESIÓN
  ========================= */

  function cerrarSesion() {
    localStorage.removeItem(
      "sesionAdmin"
    );

    if (panelAdmin) {
      panelAdmin.style.display =
        "none";
    }

    const contacto =
      document.getElementById(
        "seccion-contacto"
      );

    const login =
      document.getElementById(
        "seccion-login"
      );

    if (contacto) {
      contacto.style.display =
        "block";
    }

    if (login) {
      login.style.display =
        "block";
    }

    actualizarBarraEstado();

    mostrarNotificacionReserva();
  }


  /* =========================
     LOGIN
  ========================= */

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      (evento) => {

        evento.preventDefault();

        const usuario =
          document
            .getElementById("user")
            .value
            .trim();

        const password =
          document
            .getElementById("pass")
            .value
            .trim();

        const error =
          document.getElementById(
            "error-login"
          );

        error.textContent = "";
        error.style.color = "#ff4d4d";
        error.style.fontWeight = "bold";

        if (
          usuario === "" ||
          password === ""
        ) {
          error.textContent =
            "Debes ingresar usuario y contraseña.";

          return;
        }

        if (
          usuario === "admin" &&
          password === "1234"
        ) {

          localStorage.setItem(
            "sesionAdmin",
            "activa"
          );

          loginForm.reset();

          mostrarPanelAdmin();

        } else {

          error.textContent =
            "Usuario o contraseña incorrectos.";
        }
      }
    );

    if (
      localStorage.getItem(
        "sesionAdmin"
      ) === "activa"
    ) {
      mostrarPanelAdmin();
    }
  }


  /* =========================
     FINANZAS
  ========================= */

  const calcForm =
    document.getElementById(
      "calc-form"
    );

  if (calcForm) {

    const dominioInput =
      document.getElementById(
        "dominio"
      );

    const hostingInput =
      document.getElementById(
        "hosting"
      );

    const horasInput =
      document.getElementById(
        "horas"
      );

    const cpcInput =
      document.getElementById(
        "cpc"
      );

    const clicsInput =
      document.getElementById(
        "clics"
      );

    const btnAdquirir =
      document.getElementById(
        "btn-adquirir-campana"
      );

    const mensajeCampana =
      document.getElementById(
        "mensaje-campana"
      );

    const PRECIO_HORA = 8000;

    let ultimaCotizacion = null;


    function calcularPresupuesto() {
      const error =
        document.getElementById(
          "error-finanzas"
        );

      error.textContent = "";
      error.style.color = "#ff4d4d";
      error.style.fontWeight = "bold";

      const dominioTexto =
        dominioInput.value.trim();

      const hostingTexto =
        hostingInput.value.trim();

      const horasTexto =
        horasInput.value.trim();

      const cpcTexto =
        cpcInput.value.trim();

      const clicsTexto =
        clicsInput.value.trim();

      if (
        dominioTexto === "" ||
        hostingTexto === "" ||
        horasTexto === "" ||
        cpcTexto === "" ||
        clicsTexto === ""
      ) {

        error.textContent =
          "Debes completar todos los campos.";

        return false;
      }

      const dominio =
        Number(dominioTexto);

      const hosting =
        Number(hostingTexto);

      const horas =
        Number(horasTexto);

      const cpc =
        Number(cpcTexto);

      const clics =
        Number(clicsTexto);

      if (
        isNaN(dominio) ||
        isNaN(hosting) ||
        isNaN(horas) ||
        isNaN(cpc) ||
        isNaN(clics)
      ) {

        error.textContent =
          "Todos los valores deben ser numéricos.";

        return false;
      }

      if (
        dominio <= 0 ||
        hosting <= 0 ||
        horas <= 0 ||
        cpc <= 0 ||
        clics <= 0
      ) {

        error.textContent =
          "Todos los valores deben ser mayores a 0.";

        return false;
      }

      const capitalHumano =
        PRECIO_HORA * horas;

      const googleAds =
        cpc * clics;

      const total =
        dominio +
        hosting +
        capitalHumano +
        googleAds;

      document
        .getElementById("cot-dominio")
        .textContent =
          formatoCLP(dominio);

      document
        .getElementById("cot-hosting")
        .textContent =
          formatoCLP(hosting);

      document
        .getElementById(
          "calculo-programacion"
        )
        .textContent =
          horas +
          " × " +
          formatoCLP(PRECIO_HORA);

      document
        .getElementById(
          "cot-programacion"
        )
        .textContent =
          formatoCLP(capitalHumano);

      document
        .getElementById(
          "calculo-ads"
        )
        .textContent =
          clics +
          " × " +
          formatoCLP(cpc);

      document
        .getElementById(
          "cot-ads"
        )
        .textContent =
          formatoCLP(googleAds);

      document
        .getElementById(
          "total-proyecto"
        )
        .textContent =
          formatoCLP(total);

      const advertencia =
        document.getElementById(
          "advertencia-ads"
        );

      if (googleAds > 50000) {

        advertencia.textContent =
          "⚠️ Presupuesto de marketing alto para fase de lanzamiento";

        advertencia.className =
          "advertencia-ads alta";

      } else {

        advertencia.textContent =
          "Presupuesto de marketing dentro del rango de lanzamiento.";

        advertencia.className =
          "advertencia-ads normal";
      }

      ultimaCotizacion = {
        dominio: dominio,
        hosting: hosting,
        tarifaHora: PRECIO_HORA,
        horas: horas,
        capitalHumano: capitalHumano,
        cpc: cpc,
        clics: clics,
        googleAds: googleAds,
        total: total
      };

      guardarJSON(
        "ultimaCotizacionMocktails",
        ultimaCotizacion
      );

      return true;
    }


    calcForm.addEventListener(
      "submit",
      (evento) => {

        evento.preventDefault();

        calcularPresupuesto();
      }
    );


    if (btnAdquirir) {

      btnAdquirir.addEventListener(
        "click",
        () => {

          if (!calcularPresupuesto()) {
            return;
          }

          guardarJSON(
            "campanaAdquirida",
            {
              fecha:
                new Date()
                  .toLocaleString("es-CL"),

              cotizacion:
                ultimaCotizacion
            }
          );

          if (mensajeCampana) {

            mensajeCampana.textContent =
              "Solicitud realizada correctamente.";

            mensajeCampana.style.color =
              "#87CEEB";
          }
        }
      );
    }

    calcularPresupuesto();
  }


  /* =========================
     CAMBIOS ENTRE PESTAÑAS
  ========================= */

  window.addEventListener(
    "storage",
    (evento) => {

      if (
        evento.key ===
        "notificacionesReservaCliente"
      ) {
        mostrarNotificacionReserva();
      }

      if (
        evento.key ===
        "pedidosMocktails"
      ) {
        actualizarBarraEstado();
        mostrarResumenReservas();
      }

      if (
        evento.key ===
        "stockMocktails"
      ) {
        stockActual =
          obtenerStock();

        if (catalogoContainer) {
          renderCatalogo();
        }
      }
    }
  );


  /* =========================
     INICIO
  ========================= */

  actualizarBarraEstado();

  mostrarNotificacionReserva();

});