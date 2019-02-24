const express = require('express');

let { verificaToken, verificaAdmin_role } = require('../middleware/autentificacion');

let app = express();

let Categoria = require('../models/categoria');


app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({}, 'descripcion')
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoria) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.count({}, (err, conteo) => {

                res.json({
                    ok: true,
                    categoria,
                    cuantos: conteo
                });

            });


        });

});

app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    })

});

app.post('/categoria', verificaToken, (req, res) => {
    //Regresa la nueva categoria

    let body = req.body;

    console.log(body);
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    Categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: categoriaDB
        });
    })

});

app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descripcion, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    })

});

app.delete('/categoria/:id', [verificaToken, verificaAdmin_role], (req, res) => {
    //Solo un administrador puede borrar una categoría
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!categoriaBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: categoriaBorrado
        });

    });
});


module.exports = app;