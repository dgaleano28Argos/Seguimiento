//declaración e inicialización de variables
let dataTable;
let dataTableIsInitialized=false;
var datosTabla=[];
var table;
var apiKey,
sessionId,
logonParams = {
 username: 'ggcotraficoseguimiento@argos.com.co',
 password: 'Logi2023'
};

//metodo para loguearce
var api = GeotabApi(function (authenticateCallback) {
    authenticateCallback('my.geotab.com', 'transportempo', 'ggcotraficoseguimiento@argos.com.co', 'Logi2023', function(err) {
        console.error(err);
    });
});


//funcion que inicializa la tabla en blanco llama la funcion obtener datos que trae la info de la API y la llena
function inicializarTabla(){
    if(dataTableIsInitialized){
        dataTable.destroy();

    }
    ObtenerDatos();
    dataTable=$("#tableDevice").DataTable(dataTableOptions);
    dataTableIsInitialized=true;
    
};

//obtiene los datos de DevicesStatusInfo con grupo identificado como b2714 y de estos obtine el device
async function ObtenerDatos(){
    //obtiene los datos de DevicesStatusInfo con grupo identificado como b2714 
  return await  api.call('Get', {
        typeName: 'DeviceStatusInfo',
            search:{
                GroupSearch:{
                    id:'b2714'
                },
                
            }
        }, function (result) {  
            if (result) {
                for(device in result){
                    
                   obtenerPlaca(result[device].device.id,result[device].latitude,result[device].longitude,new Date(Date.parse(result[device].dateTime)))
                   
                };
            }
        }, function (err) {
            console.error(err);
        });

    //obtiene los datos Devices buscando por ID con el filtro ya aplucado del grupo
    function obtenerPlaca(idDevice,latitude,longitude,fecha){
        api.call('Get', {
                typeName: 'Device',
                search:{
                    id:idDevice
                },    
            },function (results) {
                //llenar tabla
                var datos=[{
                    id: idDevice,
                    placa: results[0].name,
                    latitud: latitude,
                    longitud: longitude,
                    fecha: fecha,
                    
                }]
                llenarTabla(datos);
                   
                
            },
            function (err) {
                console.error(err);
            
            });   
    }

    //llena la tabla como tal
    let content =``;
    let body =document.getElementById("tablebody_device");
  
    function llenarTabla(datos){
       


        
        table.row
    .add([
        datos[0].id,
        datos[0].placa,
        new Date(datos[0].fecha).toLocaleString("es-ES"),
        datos[0].fecha.toISOString(),
        datos[0].latitud,
        datos[0].longitud,
        `<button type="button" class=" btn btn-secondary" data-bs-toggle="modal" data-bs-target="#miModal">Ver Excepciones</button>`

    ])
    
    .draw(false);
    };

    
}

//inicializa la tabla para darle formato
$(document).ready( async function() {

table=   $("#tableDevice").DataTable({
   
    "paging": true,
    "lengthChange": true,
    "lengthMenu": [ 50, 100,200,300 ],
    "order": [[ 3, 'desc' ]]
    
    
});
const dr= await ObtenerDatos();

setTimeout(function(){
    document.getElementById("loader").classList.toggle("loader2");
}, 3000);

});


   

