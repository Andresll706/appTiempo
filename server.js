// Use Express
var express = require("express");
// Use body-parser
var bodyParser = require("body-parser");
// Use https
// const https = require('https')

//Use Axios
const axios = require('axios');

// Use Cors
var cors = require('cors');

// Use supertest
// const request = require('supertest');

// Create new instance of the express server
var app = express();

app.use(cors());

// Define the JSON parser as a default way 
// to consume and produce data through the 
// exposed APIs
app.use(bodyParser.json());

// Create link to Angular build directory
// The `ng build` command will save the result
// under the `dist` folder.
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

var key = 'key';

// Init the server
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
    GetMunicipios();
});


/*  "/api/status"
 *   GET: Get server status
 *   PS: it's just an example, not mandatory
 */
app.get("/api/status", function (req, res) {
    res.status(200).json({ status: "UP" });
});

// ***********************************
//  GET MUNICIPIOS
// ***********************************
var datosfiltrados=[];

async function GetMunicipios(){
    let datos = '';
    const settingsMunicipios = {
        url: 'https://opendata.aemet.es/opendata/api/maestro/municipios?api_key='  + key,
        method: 'GET',
        async: true,
        crossDomain: true,
        headers: 
        { 
            'Content-Type': 'application/json;charset=UTF-8'
        },
        responseEncoding: 'binary'
    };
    
    try{
        await axios(settingsMunicipios)
                .then(function (response) {
                    // handle success
                    //console.log(response);
                    let j = 0;
                    response.data.forEach(function (entry) {
                        entry.nombre;
                        datosfiltrados[j] = { "codigo": entry.id.substring(2, entry.id.length), "nombre": entry.nombre };
                        j++;
                    });
                    process.stdout.write(JSON.stringify(datosfiltrados) + '\n');
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                })
                .then(function () {
                    // always executed
                });
    } catch(error){
        console.log(error.response.body);
    }
}

app.get("/api/municipios", function(req,res){
    GetMunicipios();
    res.send(JSON.stringify(datosfiltrados));
});



// ***********************************
//  GET TIEMPO MUNICIPIOS
// ***********************************
var tiempo = [];


async function GetTiempoMunicipio( codigo , unidad ) {
    const settings = {
        url: 'https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/'+codigo+'?api_key=' + key ,
        method: 'GET',
        async: true,
        crossDomain: true,
        responseEncoding: 'binary'
    };

    var pathDatos = [];
    let response ="";
    await axios(settings)
        .then(async function (response) {
            let datosJSON = response.data;
            pathDatos = datosJSON.datos;
            pathDatos = pathDatos.slice(-8); 
            //process.stdout.write(pathDatos + '\n');
            const settingsTempMunicipios = {
                url: 'https://opendata.aemet.es/opendata/sh/' + pathDatos,
                method: 'GET',
                async: true,
                crossDomain: true,
                responseEncoding: 'binary'
            };
            await axios(settingsTempMunicipios) 
            .then(function (response2) {
                let datosTiempo = response2.data;
                //process.stdout.write(JSON.stringify(datosTiempo) + '\n');
                let tempMedia = (datosTiempo[0].prediccion.dia[1].temperatura.maxima + datosTiempo[0].prediccion.dia[1].temperatura.minima)/2;
                process.stdout.write(unidad + '\n');
                if(unidad == "G_FAH"){
                    tempMedia = (tempMedia * 9 / 5) + 32;
                }

                tiempo = [
                    {
                        "mediaTemperatura": tempMedia,
                        "unidadTemperatura": unidad,
                        "probPrecipitacion": [
                        {
                            "probabilidad": datosTiempo[0].prediccion.dia[1].probPrecipitacion[3].value,
                            "periodo": "00-06"
                        },
                        {
                            "probabilidad": datosTiempo[0].prediccion.dia[1].probPrecipitacion[4].value,
                            "periodo": "06-12"
                        },
                        {
                            "probabilidad": datosTiempo[0].prediccion.dia[1].probPrecipitacion[5].value,
                            "periodo": "12-18"
                        },
                        {
                            "probabilidad": datosTiempo[0].prediccion.dia[1].probPrecipitacion[6].value,
                            "periodo": "18-24"
                        }]
                    }];
                process.stdout.write(JSON.stringify(tiempo) + '\n');
            }).catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
        }).catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}


app.get("/api/tiempo", function(req,res){
    let codigo = req.query.codigo;
    let unidad = req.query.unidad;
    process.stdout.write(unidad + '\n');
    GetTiempoMunicipio(codigo, unidad);
    res.send(JSON.stringify(tiempo));
});

module.exports = app;

// //---------------- pruebas ------------------
// request(app)
//   .get('/api/status')
//   .expect('Content-Type', /json/)
//   .expect('Content-Length', '15')
//   .expect(200)
//   .end(function(err, res) {
//     if (err) throw err;
//   });
