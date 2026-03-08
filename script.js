// CONFIGURACIÓN DE CONEXIÓN
const supabaseUrl = 'https://ekllusthrzmilknwivec.supabase.co';
const supabaseKey = 'sb_publishable_na0BQsihDxdwjOMeVh_Clg_Fss0UTIq';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

let totalVendido = 0;
let historialVentas = [];

// CARGA INICIAL
window.onload = async function() {
    await cargarProductos();
    await cargarVentasHoy();
};

async function cargarProductos() {
    const { data, error } = await _supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

    if (error) console.error("Error cargando productos:", error);
    else {
        const contenedor = document.getElementById('contenedor-botones');
        const datalist = document.getElementById('sugerencias');
        contenedor.innerHTML = ""; 
        datalist.innerHTML = "";

        data.forEach(p => {
            // Creamos el botón con la clase de brillo interactivo
            const btn = document.createElement('div');
            btn.className = 'item-registro';
            btn.style.display = 'flex';
            btn.style.justifyContent = 'space-between';
            btn.innerHTML = `<span>${p.nombre}</span> <span style="opacity:0.6;">$${parseFloat(p.precio).toFixed(2)}</span>`;
            
            // Evento de clic
            btn.onclick = () => registrarVenta(p.nombre, p.precio);
            contenedor.appendChild(btn);

            // Sugerencias buscador
            const opt = document.createElement('option');
            opt.value = p.nombre;
            datalist.appendChild(opt);
        });
    }
}

async function cargarVentasHoy() {
    const { data, error } = await _supabase
        .from('ventas')
        .select('*')
        .order('fecha_hora', { ascending: true });

    if (error) console.error("Error cargando ventas:", error);
    else {
        const cuadroVentas = document.getElementById('cuadro-ventas');
        cuadroVentas.innerHTML = "";
        totalVendido = 0;
        historialVentas = data;

        data.forEach(v => {
            const hora = new Date(v.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // Cada venta es un item con brillo rápido al pasar el mouse
            const div = document.createElement('div');
            div.className = 'item-registro';
            div.style.cursor = 'default'; // Las ventas no se clickean
            div.innerHTML = `<span style="color:#ff3ca6;">[${hora}]</span> ${v.producto} - <span style="opacity:0.8;">$${parseFloat(v.precio).toFixed(2)}</span>`;
            
            cuadroVentas.appendChild(div);
            totalVendido += parseFloat(v.precio);
        });
        document.getElementById('total-display').innerText = `$${totalVendido.toFixed(2)}`;
        cuadroVentas.scrollTop = cuadroVentas.scrollHeight;
    }
}

async function registrarVenta(nombre, precio) {
    const { error } = await _supabase
        .from('ventas')
        .insert([{ producto: nombre, precio: precio }]);

    if (error) alert("Error al guardar venta.");
    else await cargarVentasHoy();
}

async function limpiarVentas() {
    if(confirm("¿Estás seguro de borrar solo el historial de ventas? Tus productos no se borrarán.")) {
        const { error } = await _supabase.from('ventas').delete().neq('id', 0);
        if (error) alert("Error al limpiar.");
        else location.reload();
    }
}

async function crearBoton() {
    const nombre = document.getElementById('nombreId').value.trim();
    const precio = parseFloat(document.getElementById('precioId').value);

    if (!nombre || isNaN(precio)) return;

    const { error } = await _supabase.from('productos').insert([{ nombre, precio }]);
    if (error) alert("Error al añadir producto.");
    else {
        document.getElementById('nombreId').value = "";
        document.getElementById('precioId').value = "";
        await cargarProductos();
        // Opcional: enfocar de nuevo el input por si quieres agregar varios seguidos
        document.getElementById('nombreId').focus();
    }
}

function exportarSQL() {
    let reporteDiv = document.getElementById('reporte-sql') || document.createElement('div');
    reporteDiv.id = 'reporte-sql';
    reporteDiv.style.marginTop = '20px';
    reporteDiv.style.padding = '15px';
    reporteDiv.style.border = '1px solid #ff3ca6';
    reporteDiv.style.background = '#1a1a2e';
    reporteDiv.style.color = '#fff';
    reporteDiv.style.borderRadius = '10px';
    
    // Lo añadimos al final del body para que no rompa el diseño grid
    document.body.appendChild(reporteDiv);

    reporteDiv.innerHTML = `
        <h3 style="color: #ff3ca6; margin-top: 0;">>_ Reporte Final</h3>
        <p style="margin: 5px 0;">Ventas hoy: <strong>${historialVentas.length}</strong></p>
        <p style="margin: 5px 0;">Total: <strong style="color: #00ff00;">$${totalVendido.toFixed(2)}</strong></p>
        <p style="font-size: 0.8em; color: gray; margin-top: 10px;">AndromedaApp</p>
    `;
    reporteDiv.scrollIntoView({ behavior: 'smooth' });
}