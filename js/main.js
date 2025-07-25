document.addEventListener("DOMContentLoaded", () => {
    const contenedorProductos = document.getElementById("productos-contenedor");
    const contenedorCarrito = document.getElementById("carrito");
    const totalCarrito = document.getElementById("total-carrito");
    const btnToggleCarrito = document.getElementById("toggle-carrito");
    const btnFinalizarCompra = document.getElementById("finalizar-compra");

    // Cargar carrito desde localStorage o vacío
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Mostrar productos desde JSON
    function cargarProductos() {
        fetch("./assets/menu.json")
            .then(respuesta => respuesta.json())
            .then(productos => {
                productos.forEach(producto => {
                    const tarjeta = document.createElement("div");
                    tarjeta.classList.add("tarjeta");
                    tarjeta.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.descripcion}" class="tarjeta-imagen" />
            <h3 class="tarjeta-titulo">${producto.nombre}</h3>
            <p class="tarjeta-descripcion">${producto.descripcion}</p>
            <p class="tarjeta-precio">$${producto.precio}</p>
            <button class="tarjeta-boton" data-id="${producto.id}">Agregar al carrito</button>
          `;
                    tarjeta.querySelector(".tarjeta-boton").addEventListener("click", () => {
                        agregarAlCarrito(producto);
                    });
                    contenedorProductos.appendChild(tarjeta);
                });
            })
            .catch(() => {
                contenedorProductos.innerHTML = "<p>Error cargando productos, recarga la página.</p>";
            });
    }

    // Agregar producto al carrito
    function agregarAlCarrito(producto) {
        carrito.push(producto);
        guardarYMostrarCarrito();
        Toastify({
            text: "Producto agregado al carrito 🛒",
            duration: 2500,
            gravity: "bottom",
            position: "right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
    }

    // Guardar carrito en localStorage y mostrarlo
    function guardarYMostrarCarrito() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
        mostrarCarrito();
    }

    // Mostrar carrito en pantalla
    function mostrarCarrito() {
        contenedorCarrito.innerHTML = "";

        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = "<p>El carrito está vacío.</p>";
            totalCarrito.textContent = "";
            btnFinalizarCompra.classList.add("oculto");
            return;
        }

        carrito.forEach((producto, index) => {
            const item = document.createElement("div");
            item.classList.add("carrito-item");
            item.innerHTML = `
        <p><strong>${producto.nombre}</strong></p>
        <p>Precio: $${producto.precio}</p>
        <button class="eliminar" data-index="${index}">Eliminar</button>
      `;
            contenedorCarrito.appendChild(item);
        });

        const total = carrito.reduce((acc, p) => acc + p.precio, 0);
        totalCarrito.textContent = `Total: $${total}`;
        btnFinalizarCompra.classList.remove("oculto");

        // Eventos eliminar productos
        document.querySelectorAll(".eliminar").forEach(boton => {
            boton.addEventListener("click", e => {
                const idx = e.target.dataset.index;
                carrito.splice(idx, 1);
                guardarYMostrarCarrito();
            });
        });
    }

    // Mostrar / ocultar carrito
    btnToggleCarrito.addEventListener("click", () => {
        contenedorCarrito.classList.toggle("oculto");
        totalCarrito.classList.toggle("oculto");
        btnFinalizarCompra.classList.toggle("oculto");
    });

    // Finalizar compra
    btnFinalizarCompra.addEventListener("click", () => {
    if (carrito.length === 0) {
        Swal.fire({
            title: "Carrito vacío",
            text: "Agrega productos antes de finalizar",
            icon: "warning",
            confirmButtonText: "OK"
        });
        return;
    }

    const total = carrito.reduce((acc, producto) => acc + producto.precio, 0);

    const nuevoPedido = {
        id: Date.now(),
        productos: [...carrito],
        fecha: new Date().toLocaleString(),
        total: total
    };

    const pedidosAnteriores = JSON.parse(localStorage.getItem("pedidos")) || [];
    pedidosAnteriores.push(nuevoPedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidosAnteriores));

    fetch("https://api.adviceslip.com/advice")
        .then(res => res.json())
        .then(data => {
            Swal.fire({
                title: `¡Gracias por tu compra, ${user.name.firstname}!`,
                html: `<p>"${data.content}"</p><small>- ${data.author}</small>`,
                icon: "success",
                confirmButtonText: "Aceptar"
            });
        })
        .catch(() => {
            Swal.fire({
                title: "¡Gracias por tu compra!",
                text: "tu compra fue registrada.",
                icon: "success",
                confirmButtonText: "Aceptar"
            });
        });

    carrito = [];
    localStorage.removeItem("carrito");
    guardarYMostrarCarrito();
});



    // Inicio
    cargarProductos();
    mostrarCarrito();
});
