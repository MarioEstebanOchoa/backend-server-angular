var express = require('express');
var fileUpload = require('express-fileupload');


var app = express();

var fs = require('fs');

var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');


// default options
app.use(fileUpload());


app.put('/:tipo/:id', function(req, res) {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos de coleccion
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de coleccion no es valida' }
        })
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        })
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];


    // Solo estas extensiones aceptamos

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensions validas son ' + extensionesValidas.join(', ') }
        })
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;


    //Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            })
        }


        subirPorTipo(tipo, id, nombreArchivo, res)


    })
});


function subirPorTipo(tipo, id, nombreArchivo, res) {


    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                })
            }

            if (!usuario) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe un usuario con ese ID',
                    errors: err
                })
            }


            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo)
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                })
            })
        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                })
            }

            if (!hospital) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe un hospital con ese ID',
                    errors: err
                })
            }


            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo)
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                })
            })
        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                })
            }

            if (!medico) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe un medico con ese ID',
                    errors: err
                })
            }


            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo)
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                })
            })
        });

    }

}


module.exports = app;