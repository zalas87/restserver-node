const express = require('express');

const {} = require('../middlewares/autentification');

let app = express();

//===================
// Obtener productos
//===================
app.get('/productos', verificaToken, (req, res) => {
    // Trae todos los productos
    // populate: usuario, categoria
    // paginado

    let desde = req.query.desde || 0;
    desde = Numbre(desde);

    Producto.find({}, 'nombre precioUni descripcion disponible')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count({}, (err, conteo) => {

                res.json({
                    ok: true,
                    producto,
                    cuantos: conteo
                });

            });


        });
});


//=========================
// Obtener productos por ID
//=========================
app.get('/productos/:id', verificaToken, (req, res) => {
    // populate: usuario, categoria
    // paginado
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        })
});

//=========================
// Buscar producto
//=========================
app.get('productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regexp = new RegExp(termino, 'i');

    Producto.find({ nombre: regexp })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        })

})


//=========================
// Crear un nuevo producto
//=========================
app.post('/productos', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado

    let body = req.body;

    console.log(body);
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descricion;
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    })
});

//=========================
// Actualizar un producto
//=========================
app.put('/productos/:id', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado
    let id = req.params.id;
    let body = req.body;

    let descProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria

    };

    Producto.findByIdAndUpdate(id, descProducto, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    })

});

//=========================
// Borra un producto
//=========================
app.delete('/productos/:id', verificaToken, (req, res) => {
    // disponible pase a falso
    let id = req.params.id;

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    let cambiaEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado,
            mensaje: 'Producto borrado'
        });

    });

});


module.exports = app;