'use strict'
var validator = require('validator');
var Article = require('../models/article');
var fs = require('fs');
var path = require('path');

var controller = {
    datosCurso: (req, res) => {    
        var hola = req.body.hola;

        return res.status(200).send({
            curso: 'Master en Programación JS',
            autor: 'Pedro',
            url: 'google.com',
            hola
        });
    },

    test: (req, res) => {
        return res.status(200).send({
            message: 'Action TEST'
        });
    },

    save: (req, res) => {
        //Get params
        var params = req.body;

        //Validate data
        try {
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);

        } catch (error) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar...'
            });
        }

        if(validateTitle && validateContent) {
            // Create Object to save
            var article = new Article();

            //Asign values
            article.title = params.title;
            article.content = params.content;
            article.imagen = null;

            //Save
            article.save((err, articleStore) => {

                if(err || !articleStore) {
                    return res.status(404).send({
                        status: 'error',
                        article: 'Article no se ha guardado!'
                    });
                }

                //Return response
                return res.status(200).send({
                    status: 'success',
                    article: articleStore
                });
            });

            
        } else {
            return res.status(200).send({
                status: 'error',
                article: 'Datos no válidos'
            });
        }
        
    },

    getArticles: (req, res) => {

        var query = Article.find({});
        var last = req.params.last;
        
        if(last || last != undefined) {
            query.limit(5);
        }

        //Find
        query.sort('-_id').exec((err, articles) => {

            if(err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los artículos'
                });
            }

            if(!articles) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay artículos para mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        });       
    },

    getArticle: (req, res) => {

        //Get id from url
        var articleid = req.params.id;
        
        // Existe ?
        if(!articleid || articleid == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No contiene params'
            });
        }

        //Buscar articulo
        Article.findById(articleid, (err, article) => {
            
            if(err || !article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay artículo'
                });
            }
            //Devolver json
            return res.status(200).send({
                status: 'success',
                article
            });

        });    
    },

    update: (req, res) => {
        
        // Get id para
        var articleid = req.params.id;

        // Recoger put
        var params = req.body;

        // Validate
        try {
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);

        } catch (error) {
            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }

        if(validateTitle && validateContent) {
            Article.findByIdAndUpdate({ _id: articleid}, params, {new: true}, (err, articleUpdated) => {
                if(err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error update'
                    });
                }

                if(!articleUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe articulo'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    message: 'Article updated'
                });
            });
        } else {
            return res.status(404).send({
                status: 'error',
                message: 'Validación no es correcta'
            });
        }   
    },

    delete: (req, res) => {

          // Get id para
          var articleid = req.params.id;

          // Find and delete
          Article.findByIdAndDelete({_id: articleid}, (err, articleRemoved) => {
              if(err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                });
              }

              if(!articleRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado o no existe'
                });
              }
              
              return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });
          })       
    },

    upload: (req, res) => {
        // Set module connect multiparty

        // Get file from request
        var file_name = 'Imagen no subida...';

        if(!req.files) {
            return res.status(200).send({
                status: 'error',
                message: file_name
            });
        }

        // Get name and ext from file
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // En linux o Mac var file_split = file_path.split('/');

        var file_name = file_split[2];
        //Validate image
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        //If Ok
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            fs.unlink(file_path,(err) =>{
                return res.status(200).send({
                   status: 'error',
                   message: 'La extensión no es valida'

                });
            })
        } else {  
            //Find article and set image
            var articleid = req.params.id;

            Article.findByIdAndUpdate({_id: articleid}, {imagen: file_name}, {new: true}, (err, articleUpdated) => {

                if(err || ! articleUpdated) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'Error al subir imagen'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
            })            
        }        
    },

    getImage: (req, res) => {

        var file = req.params.image;

        var path_file = './upload/articles/' + file;

        fs.exists(path_file, (exists) => {

            if(exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no exsite'
                });
            }
        })
        
    },

    search: (req, res) => {
        // Get search string
        var searchString = req.params.search;


        // Find
        Article.find({ "$or": [
            { "title": {"$regex": searchString, "$options": "i"}},
            { "content": {"$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
            }

            if(!articles || articles.length <= 0){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay artículos en la busqueda'
                });
            }
            return res.status(200).send({
                status: 'success',
                articles
            });
        })

        
    }
}

module.exports = controller;