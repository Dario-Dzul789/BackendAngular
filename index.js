const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

//const app2 = express();
//app2.use(cors());
//app2.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// LOGIN
app.get('/usuarios/login/:nombre/:contrasena', (req, res) => {
  const { nombre, contrasena } = req.params
  const query = `SELECT * FROM usuarios WHERE nombre = ? AND contrasena= ?`
  db.query(query, [nombre, contrasena], (err, results) => { 
      if(err) {
          console.error(err)
          return res.status(500).send('Usuario No Existe')
      }
      res.json(results);
  })
})


// CREATE USUARIOS
app.post('/usuarios', (req, res) => {
  const { nombre,contrasena ,email,fecha_nacimiento,signo } = req.body;
  const fechaNacimiento = new Date(fecha_nacimiento)
  let fechaNacimientoStr = fechaNacimiento.toISOString().split('T')[0]
  //db.query('INSERT INTO usuarios (nombre,contrasena, email,fecha_nacimiento,signo) VALUES (?, ?, ?,?,?)', [nombre, contrasena, email,fecha_nacimiento,signo], (err, result) => {
  db.query('INSERT INTO usuarios (nombre,contrasena, email,fecha_nacimiento,signo) VALUES (?, ?, ?,?,?)', [nombre, contrasena, email,fechaNacimientoStr,signo], (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
  console.log("nombre "+nombre)
  console.log("contrasena "+contrasena)
  console.log("email "+email)
  console.log("fecha_nacimiento "+fecha_nacimiento)
  console.log("fechaNacimientoStr "+fechaNacimientoStr)
  console.log("signo "+signo)
});

// CREATE PRODUCTOS
app.post('/productos', (req, res) => {
  const { codigo,nombre, precio,existencia } = req.body;
  db.query('INSERT INTO productos (codigo,nombre, precio,existencia) VALUES (?, ?,?,?)', [codigo, nombre, precio,existencia], (err, result2) => {

    db.query('SELECT LAST_INSERT_ID() As id', (err, result) => {
      console.log('ID del registro insertado:', result);
      res.json(result);
      console.log(result);
    });
    //if (err) return res.json(err);
  });
});


// READ USUARIOS
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});



// READ PRODUCTOS
/*app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});
*/
// READ PRODUCTOS TODOS
app.get('/productos/todos', (req, res) => {
  db.query('SELECT * FROM productos', (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// UPDATE USUARIOS
app.put('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, contrasena, email,fecha_nacimiento,signo } = req.body;
  const fechaNacimiento = new Date(fecha_nacimiento)
  let fechaNacimientoStr = fechaNacimiento.toISOString().split('T')[0]
  //db.query('UPDATE usuarios SET nombre = ?, contrasena= ?, email = ?,fecha_nacimiento= ?,signo= ? WHERE id = ?', [nombre, contrasena, email,fecha_nacimiento,signo,id], (err, result) => {
  db.query('UPDATE usuarios SET nombre = ?, contrasena= ?, email = ?,fecha_nacimiento= ?,signo= ? WHERE id = ?', [nombre, contrasena, email,fechaNacimientoStr,signo,id], (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
  console.log("nombre "+nombre)
  console.log("contrasena "+contrasena)
  console.log("email "+email)
  console.log("fecha_nacimiento "+fecha_nacimiento)
  console.log("fechaNacimientoStr "+fechaNacimientoStr)
  console.log("signo "+signo)
  console.log("id "+id)
});

// UPDATE PRODUCTOS
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { codigo,nombre, precio,existencia } = req.body;
  db.query('UPDATE productos SET codigo = ?,nombre = ?, precio = ?,existencia=? WHERE id = ?', [codigo,nombre, precio,existencia, id], (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// UPDATE EXISTENCIAS PRODUCTOS
app.put('/productos', (req, res) => {
  const { id,codigo,nombre, precio,existencia } = req.body;
  db.query('UPDATE productos SET existencia=? WHERE id = ?', [existencia, id], (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// DELETE USUARIOS
app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// DELETE USUARIOS PRODUCTOS
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});


// BUSCAR PRODUCTO POR ID
app.get('/productosS/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// BUSCAR PRODUCTO POR CODIGO
app.get('/productos/:codigo', (req, res) => {
  const { codigo } = req.params;
  db.query('SELECT * FROM productos WHERE codigo = ?', [codigo], (err, result) => {
    if (err) return res.json(err);
      res.json(result);
  });
});

// RUTA PARA OBTENER LAS VENTAS EN UN RANGO DE FECHAS 
app.get('/ventas/fechas/:inicio/:fin', (req, res) => {
  const { inicio, fin } = req.params

  if(!inicio || !fin) {
      return res.status (400).send('Las fechas son obligatorias')
  }

  const fechaInicio = new Date(inicio)
  const fechaFin = new Date(fin)


  // VALIDAMOS QUE LAS FECHAS SEAN CORRECTAS
  if(isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).send('Las fechas proporcionadas no son validas')
  }

  // ASEGURAMOS QUE LA FECHA INICIO NO SEA MAYOR A FECHA FINAL
  if (fechaInicio > fechaFin) {
      return res.status(400).send('La fecha de inicio no puede ser posterior a la fecha final')
  }

  // FORMATEAMOS LAS FECHAS YYYY-MM-DD PARA LA CONSULTA SQL 
  let fechaInicioStr = fechaInicio.toISOString().split('T')[0] +" 00:00:00.000"
  //let fechaInicioStr = inicio.toISOString().split('T')[0] 
 

  let fechaFinStr = fechaFin.toISOString().split('T')[0]+ " 23:59:59.999"
  //let fechaFinStr = fin.toISOString().split('T')[0]

  

  const query = `SELECT * FROM ventas WHERE fecha_venta BETWEEN ? AND ?`

  //db.query(query, [inicio, fin], (err, results) => { 
  db.query(query, [fechaInicioStr, fechaFinStr], (err, results) => { 
      if(err) {
          console.error(err)
          return res.status(500).send('Error al obtener las ventas')
      }
      res.json(results);
  })
  //console.log(fechaInicio);
  //console.log(fechaFinStr);
  console.log("Fechas");
  console.log(fechaInicioStr);
  console.log(fechaFinStr);
})

// RUTA PARA AGREGAR REGISTRO DE VENTAS
// CODIGO-PRODUCTO-PRE_PUBLICO-CANTIDAD-TOTAL_TOTALVENTA_USUARIO 
app.post('/ventas', (req, res) => {
  const { id_venta2, productos, total_venta, fecha_venta } = req.body

  if( !productos) {
      return res.status(400).send('No se recibio la venta')
  }

  const fechay = new Date()
  // FORMATEAR FECHA EN YYYY-MM-DD
  const anio =fechay.getFullYear()
  const mes = String(fechay.getMonth() + 1).padStart(2, '0') 
  const dia = String(fechay.getDate()).padStart(2, '0')

  const id_venta = Date.now().toString()

  // crea un nuevo objeto `Date`
  var ahora = new Date();
 
  // obtener la fecha y la hora
  //var now = today.toLocaleString();

  // CREAR EL STRING EN EL FORMATO DESEADO
  const fecha_ventak = `${anio}-${mes}-${dia}`
  var FechaIngresar= new Date(fecha_venta)
  let Hora= FechaIngresar.getHours();
  //let Hora= FechaIngresar.toLocaleTimeString().split(':')[0];
  //let Minutos= FechaIngresar.toLocaleTimeString().split(':')[1];
  //let Segundos= FechaIngresar.toLocaleTimeString().split(':')[2];
  let parametroJunto=FechaIngresar.toLocaleTimeString();
  let parametro=parametroJunto[parametroJunto.length-4]+parametroJunto[parametroJunto.length-3]+parametroJunto[parametroJunto.length-2]+parametroJunto[parametroJunto.length-1];
  /*if(parametro=="p.m."){
    Hora=parseInt(Hora)+12
  }
  */
  let diaGuion=FechaIngresar.toLocaleDateString().split('/')[0]
  let mesGuion=FechaIngresar.toLocaleDateString().split('/')[1]
  let anioGuion=FechaIngresar.toLocaleDateString().split('/')[2]
  let FechaGuion=anioGuion+"-"+mesGuion+"-"+diaGuion
  let FechaNuevo=FechaGuion + " "+Hora+":"+FechaIngresar.getUTCMinutes()+":"+FechaIngresar.getUTCSeconds()+"."+FechaIngresar.getUTCMilliseconds()


  // SEPARAR LOS PRODUCTOS Y EL TOTAL DE LA VENTA(ASUMIENDO QUE VENTA VIENE COMO UN STRING 'PRODUCTOS_TOTALES')
  //const productosString = venta.split('_')
  //const productos = productosString[0]

  //const total_venta = parseFloat(productosString[1])


  // VALIDAR EL TOTAL DE LA VENTA
  if(isNaN(total_venta)) {
      return res.status(400).send('El total de la venta no es valido')
  }

  // INSERTAR LA VENTA EN LA BASE DE DATOS
  const query = `INSERT INTO ventas(id_venta, productos, total_venta, fecha_venta) 
  VALUES(?,?,?,?)`
  //console.log(FechaIngresar.toISOString())
  console.log(parametro);
  //db.query(query, [id_venta, productos, total_venta, fecha_venta], (err, result)=>{
  //db.query(query, [id_venta, productos, total_venta, ahora], (err, result)=>{
  db.query(query, [id_venta, productos, total_venta, FechaNuevo], (err, result)=>{
      if(err) {
          console.error(err)
          return res.status(500).send('Error al registrar la venta')
      }
      db.query('SELECT LAST_INSERT_ID() As id', (err, result) => {
        console.log('ID del registro insertado:', result);
        res.json(result);
        console.log(result);
      });
      /*
      res.status(201).send({
          //mensaje: 'Venta registrada con exito', 
          ahora
      })
      */
  })
  console.log(id_venta);
  
  console.log(FechaNuevo);   
})

// CREATE VENTASDETALLES
app.post('/ventasdetalles', (req, res) => {
  const { idventa, idproducto, cantidad,precio_producto,total_producto } = req.body;
  db.query('INSERT INTO ventasdetalles (idventa, idproducto, cantidad,precio_producto,total_producto) VALUES (?, ?,?,?,?)', [idventa, idproducto, cantidad,precio_producto,total_producto], (err, result) => {
    //console.log(err);
    if (err) return res.json(err);
    res.json(result);
  });
});

// BUSCAR VENTASDETALLES POR IDVENTA
app.get('/ventasdetalles/:id', (req, res) => {
  const { id } = req.params;
  db.query('select v.id,v.fecha_venta,p.codigo,p.nombre as producto,vd.cantidad,vd.precio_producto,vd.total_producto, v.total_venta from ventasdetalles vd inner join ventas v on vd.idventa=v.id inner join productos p ON p.id=vd.idproducto where vd.idventa  = ?', [id], (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

//CREATE CHATS
app.post('/chats', (req, res) => {
  const { idemisor,mensaje ,idreceptor} = req.body;
  db.query('INSERT INTO chats (idemisor,mensaje ,idreceptor) VALUES (?, ?, ?)', [idemisor,mensaje ,idreceptor], (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// CHATS
app.get('/chats/:idemisor/:idreceptor', (req, res) => {
  const { idemisor, idreceptor } = req.params
  const query = `SELECT * FROM chats WHERE (idemisor = ? AND idreceptor= ?) OR (idreceptor= ? AND idemisor = ?)`
  db.query(query, [idemisor, idreceptor, idemisor, idreceptor], (err, results) => { 
      if(err) {
          console.error(err)
          return res.status(500).send('Usuario No Existe')
      }
      res.json(results);
  })
})

// CHATS CON NOMBRES
app.get('/chats/nombres/:idemisor/:idreceptor', (req, res) => {
  const { idemisor, idreceptor } = req.params
  const query = `SELECT c.id AS id,u.id AS ide,us.id AS idr, u.nombre AS emisor ,c.mensaje AS mensaje, us.nombre as receptor FROM chats c INNER JOIN usuarios u ON u.id=c.idemisor INNER JOIN usuarios us ON us.id=c.idreceptor WHERE (c.idemisor = ? AND c.idreceptor= ?) OR (c.idreceptor= ? AND c.idemisor = ?)`
  db.query(query, [idemisor, idreceptor, idemisor, idreceptor], (err, results) => { 
      if(err) {
          console.error(err)
          return res.status(500).send('Usuario No Existe')
      }
      res.json(results);
  })
})

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});




//app2.listen(3000, () => {
  //console.log('Servidor corriendo en puerto 3000 App2');
//});


