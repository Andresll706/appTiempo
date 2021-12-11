// Use Express
var express = require("express");
// Use body-parser
var bodyParser = require("body-parser");
// Use https
const https = require('https')
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

var key = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbmRyZXNsbDcwNkBnbWFpbC5jb20iLCJqdGkiOiI3YWFkYTMzZi00NjE4LTQzYWUtYWIwYy1hOTI3NTQzM2ZiYjAiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTU2ODcyMDE2NywidXNlcklkIjoiN2FhZGEzM2YtNDYxOC00M2FlLWFiMGMtYTkyNzU0MzNmYmIwIiwicm9sZSI6IiJ9.oaEKRBmJwMcw_Ll_wf2zhoZu0mBTArXht4udFhp0u58';

// Init the server
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    //console.log("App now running on port", port);
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

function GetMunicipios(){
    let datos = '';
    const settingsMunicipios = {
        hostname: 'opendata.aemet.es',
        path: '/opendata/api/maestro/municipios?api_key=' + key,
        method: 'GET'
    };
    
    const reqMunicipios = https.request(settingsMunicipios, function(res){
    // console.log('statusCode:', res.statusCode);
    // console.log('headers:', res.headers);
    res.on('data', function(d){
    // process.stdout.write(d);
        datos += d;
    });
    res.on('end', function () {
        let datosJSON = JSON.parse(datos);
        let j = 0;
        datosJSON.forEach(function (entry) {
            entry.nombre
            datosfiltrados[j] = {"codigo":entry.id.substring(2, entry.id.length) ,"nombre": entry.nombre};
            j++;
        }); 
    });
    }).on('error', (e) => {
        console.error(e);
    }).end();
}

app.get("/api/municipios", function(req,res){
    GetMunicipios();
    res.send(JSON.stringify(datosfiltrados));
});

// ***********************************
//  GET TIEMPO MUNICIPIOS
// ***********************************
var tiempo = [];
function GetTiempoMunicipio( codigo , unidad ) {
    const settings = {
        hostname: 'opendata.aemet.es',
        path: '/opendata/api/prediccion/especifica/municipio/diaria/'+codigo+'?api_key=' + key ,
        method: 'GET'
    };

    var pathDatos = [];
    let response ="";
    const req = https.request(settings, (res) => {
        res.on('data', function(data){
         process.stdout.write(data);
         response += data;
        });
        res.on('end', function () {
            let datosJSON = JSON.parse(response);
            pathDatos = datosJSON.datos;
            pathDatos = pathDatos.slice(-8); 

            const settingsTempMunicipios = {
                hostname: 'opendata.aemet.es',
                path: '/opendata/sh/' + pathDatos,
                method: 'GET'
            };
            let response2 = "";
            const reqTempMunicipios = https.request(settingsTempMunicipios, (res) => {
                res.on('data', function(data){
                //process.stdout.write(data);
                response2 += data;
                });
                res.on('end', function () {
                let datosJSON = JSON.parse(response2);
                // process.stdout.write(JSON.stringify(datosJSON) + '\n');
                let tempMedia = (datosJSON[0].prediccion.dia[1].temperatura.maxima + datosJSON[0].prediccion.dia[1].temperatura.minima)/2;
                if(unidad == "G_FAH"){
                    tempMedia = (tempMedia * 9 / 5) + 32;
                }

                tiempo = [
                    {
                        "mediaTemperatura": tempMedia,
                        "unidadTemperatura": unidad,
                        "probPrecipitacion": [
                        {
                            "probabilidad": datosJSON[0].prediccion.dia[1].probPrecipitacion[3].value,
                            "periodo": "00-06"
                        },
                        {
                            "probabilidad": datosJSON[0].prediccion.dia[1].probPrecipitacion[4].value,
                            "periodo": "06-12"
                        },
                        {
                            "probabilidad": datosJSON[0].prediccion.dia[1].probPrecipitacion[5].value,
                            "periodo": "12-18"
                        },
                        {
                            "probabilidad": datosJSON[0].prediccion.dia[1].probPrecipitacion[6].value,
                            "periodo": "18-24"
                        }]
                    }];
                    //process.stdout.write(JSON.stringify(tiempo) + '\n');
                });
            });
          
            reqTempMunicipios.on('error', (e) => {
                console.error(e);
            });
            reqTempMunicipios.end();
        });
    });
      
    req.on('error', (e) => {
      console.error(e);
    });
    req.end();
}


app.get("/api/tiempo", function(req,res){
    let codigo = req.query.codigo;
    let unidad = req.query.unidad;
    
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