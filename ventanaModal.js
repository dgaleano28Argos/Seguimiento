//declara variables
const tabled =document.getElementById('tableDevice');
const modal =document.getElementById('modal');
const cardcontent=document.getElementById('card_content');
let content=``;
let map;


//accion al boton para abrir modal y cargar la informacion
window.addEventListener('click',(e)=>{

  if(e.target.matches(".btn-secondary")){

  

    e.stopPropagation();
    let data= e.target.parentElement.parentElement.children;
    
    
    iniciarMap();
    fillData(data);
   
  }
  if(e.target.matches(".fa-x")){
    map.off();
    map.remove();
    e.remove();
    
  }
  if(e.target.matches(".btn-close")){
    map.off();
    map.remove();
    e.remove();
    
  }

  if(e.target.matches(".collapse")){
    map.off();
    map.remove();
    e.remove();
    
  }
  if(e.target.matches(".hidden.bs.modal")){
    map.off();
    map.remove();
    e.remove();
    
  }
 
  
  
});

//obtiene la informacion del Device seleccionado
const fillData= (data)=>{
    //variables de los datos de la tabla 
    let idD=data[0].textContent;
    let placa=data[1].textContent;
    let fecha=data[2].textContent;
    let latitud=data[4].textContent;
    let longitud=data[5].textContent;
    
    let elementPlaca=document.getElementById("placa_register");
    elementPlaca.innerHTML=placa;

    //obtiene devicestatusinfo del device selleccionado
    api.call('Get', {
        typeName: 'DeviceStatusInfo',
        DeviceSearch: {
            search:{
                id:idD
            },
        }
        
    },function (results) {
        for(device in results){
            
            //si el id de la tabla concuerda con el id del devicestatus obtiene la info para obtener las exepciones
            if(results[device].device.id==idD){
                
               
                //obtiene eventos del device
                events=results[device].exceptionEvents;
                //varibles sumatorias
                let contevent=0;
                let sumevent=0;
                let sumek=0;
                //recorre los eventos del devie para calcular totales de tiempo, kilometros, y exepciones
                for(evt in events){
                    //contar exepciones
                    contevent=contevent+1;
                    //sumar distancias
                    sumek=sumek+events[evt].distance;
                   
                    
                    //para el tiempo de exepciones
                    //suma el tiempo para el total
                    let time=ObtenerHorasTotal(events[evt].duration);
                    sumevent=sumevent+time;
                    //nombre de la exepcion
                    ObtenerNombreExepcion(events[evt].rule.id,contevent.toString());
                    
                   
                    //cordenadas, velocidad de la exepcion
                    //obtener el formato adecuado de la fecha inicial de la exepcion
                    var finicial=events[evt].activeFrom
                    var finicial2=finicial.replace('T',' ')
                    var finibuscar=finicial2.replace('Z','')
                    //obtener el formato adecuado de la fecha final de la exepcion no se usa 
                    var ffinal=events[evt].activeTo
                    var ffinal2=ffinal.replace('T',' ')
                    var ffinbuscar=ffinal2.replace('Z','')
                    
                    var idUbi='name'+contevent.toString();
                    ObtenerCordenadas(finibuscar,finibuscar,idD,contevent.toString(),idUbi)

                    //obtener nombre del diagnostico
                    ObtenerNombreDiagnostico(events[evt].diagnostic.id,contevent.toString())
                    //crear la tarjeta con la informacion
                     content +=`
                     <div class="body-map-card">
                     <div class="map-card_icon">
                         <i class="fa-regular fa-circle"></i>
                         <div class="v-line">
                             <div class="v-line_l">
                             </div>
                         </div>
                         <i class="fa-solid fa-circle"></i>
                     </div>
                     <div class="map-card_content">
                       <div class="map-card-content-fini">
                         <p>${new Date(events[evt].activeFrom).toLocaleString("es-ES")}</p>
                       </div>
                       <div class="map-card-content-info">
                        
                             <div class="col-md-12">
                                 <div class="row">
                                     <div class="col-md-4 content-info_tittle">
                                     <p>Distancia:</p>
                                     <p>Duración:</p>
                                     <p>Regla:</p>
                                     <p>Coordenadas:</p>
                                     <p>Velocidad:</p>
                                     <p>Diagnostico:</p>
                                     </div>
                                     <div class="col-md-8 content-info_subti">
                                         <p>${events[evt].distance}</p>
                                         <p id="${'time'+contevent.toString()}">${ObtenerHoras(events[evt].duration)}</p>
                                         <p id="${'name'+contevent.toString()}"></p>
                                         <p id="${'coordenadas'+contevent.toString()}"></p>
                                         <p id="${'velocidad'+contevent.toString()}"></p>
                                         <p id="${'diagnostico'+contevent.toString()}"></p>
                                     </div>
                                 </div>
                             </div>
                         
                       </div>
                       <div class="map-card-content-ffin">
                         <p>${new Date(events[evt].activeTo).toLocaleString("es-ES")}</p>
                         <a onclick="PrintUbi(${contevent.toString()})" class="link_view">Ver -- ><span id="${'ubi'+contevent.toString()}"></span></a>
                       </div>
                        
                     </div>
                    </div>
                    
                            `;
                     
                }
                cardcontent.innerHTML=content;
                content=``;
                let elementcont=document.getElementById("number_exp");
                elementcont.innerHTML=contevent;
                let elementtime=document.getElementById("time_exp");
                elementtime.innerHTML=Math.round(sumevent);
                let elementkilo=document.getElementById("kilometer_exp");
                elementkilo.innerHTML=Math.round(sumek);
                
            }
            
        }
      
        
    },
    function (err) {
        console.error(err);
    
    });    

}

function secondsToString(seconds) {
    var hour = Math.floor(seconds / 3600);
    hour = (hour < 10)? '0' + hour : hour;
    var minute = Math.floor((seconds / 60) % 60);
    minute = (minute < 10)? '0' + minute : minute;
    var second = seconds % 60;
    second = (second < 10)? '0' + second : second;
    return hour + ':' + minute + ':' + second;
  }

  function ObtenerNombreExepcion(idRule,cont){
    api.call('Get', {
        typeName: 'Rule',
            search:{
               
                    'id':idRule
                
                
            }
        }, function (result) {  
            if (result) {
                
                   
                    let nameRule= result[0].name;
                    if(nameRule==''){
                        nameRule='No Name'
                    }
                    if(nameRule.length>=34){
                        nameRule=nameRule.substr(0,35)+'....';
                        
                    }
                    let elementnamer=document.getElementById('name'+cont);
                    elementnamer.innerHTML=nameRule;
             
                
           
            }
        }, function (err) {
            console.error(err);
        });
       
  }

  function ObtenerCordenadas(fd,td,idDevice,cont,idUbi){
    api.call('Get', {
        typeName: 'LogRecord',
        search:{
                
                'fromDate': fd ,
                'toDate': td ,
                'deviceSearch' : {
                    'id': idDevice
                },
                
                
                
            }
        }, function (result) {  
            if (result) {
                
                let latitud= result[0].latitude.toString();
                let longitud= result[0].longitude.toString();
                let velocidad= result[0].speed.toString();
                let cordenadas = latitud + ' '+ longitud
                let elementlink=document.getElementById('ubi'+cont);
                elementlink.innerHTML=cordenadas;
                if(cordenadas.length>=34){
                    cordenadas=cordenadas.substring(0,35)+'....';
                    
                }
                let elementcordenadas=document.getElementById('coordenadas'+cont);
                elementcordenadas.innerHTML=cordenadas;
                let elementvelocidad=document.getElementById('velocidad'+cont);
                elementvelocidad.innerHTML=velocidad;
                var name= document.getElementById('name'+cont).textContent;
                var tieme= document.getElementById('time'+cont).textContent;
                var text= 'Exepcion: '+name+ '\nTiempo: '+tieme;
                L.marker([result[0].latitude,result[0].longitude]).addTo(map).bindPopup(text);
                
            }
        }, function (err) {
            console.error(err);
        });
       
  }

  
  function ObtenerNombreDiagnostico(idDiagnostico,cont){
    api.call('Get', {
        typeName: 'Diagnostic',
            search:{
               
                    'id':idDiagnostico
                
                
            }
        }, function (result) {  
            if (result) {
                
                  
                    let nameDiag= result[0].name;
                    if(nameDiag==''){
                        nameDiag='No Name'
                    }
                    if(nameDiag.length>=34){
                        nameDiag=nameDiag.substr(0,35)+'....';
                        
                    }
                    let elemendiag=document.getElementById('diagnostico'+cont);
                    elemendiag.innerHTML=nameDiag;
             
                
           
            }
        }, function (err) {
            console.error(err);
        });
       
  }

  function ObtenerHorasTotal(time){
var nuevotime;
var dias;
var horas;
var minutos;
var segundos;
//busco si hay dias
var posiciondias =time.indexOf('.');
//valido la pocicion
if(posiciondias<8){
  nuevotime=time.substr(posiciondias+1);
  dias=time.substr(0,posiciondias);
 
}else{
    nuevotime=time;
    dias=0;
}
nuevotime=nuevotime.split(':')
horas=nuevotime[0];
minutos=nuevotime[1];
segundos=nuevotime[2];


var tdias=parseFloat(dias*24)
var thoras=parseFloat(horas)
var tminutos=parseFloat(minutos/60)
var tsegundos=parseFloat(segundos/3600)



let timeTotal =tdias+thoras+tminutos+tsegundos;
return timeTotal;
}

function ObtenerHoras(time){
    var nuevotime;
    var dias;
    var horas;
    var minutos;
    var segundos;
    //busco si hay dias
    var posiciondias =time.indexOf('.');
    //valido la pocicion
    if(posiciondias<8){
      nuevotime=time.substr(posiciondias+1);
      dias=time.substr(0,posiciondias);
     
    }else{
        nuevotime=time;
        dias=0;
    }
    nuevotime=nuevotime.split(':')
    horas=nuevotime[0];
    minutos=nuevotime[1];
    segundos=nuevotime[2];
    
    
    var tdias=parseFloat(dias*24)
    var thoras=parseFloat(horas)
    var tminutos=parseFloat(minutos/60)
    var tsegundos=parseFloat(segundos/3600)
    
    if(tdias<=0 && thoras<=0 &&tminutos>0){
        return(parseFloat(parseInt(minutos)+(segundos/60)).toFixed(2)+ ' Minutos')
    }else if(tdias<=0 && thoras<=0 &&tminutos<=0)
    {
        return(parseFloat(segundos).toFixed(2)+ ' Segundos')
         
    }else{
        return((parseFloat(tdias+thoras+tminutos+tsegundos)).toFixed(2)+ ' Horas')
    }

    }

   

    function iniciarMap(){
        const mapDiv = document.getElementById("map");
       map=L.map(mapDiv).setView([4.570868,-74.297333],5)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
          });
          
          resizeObserver.observe(mapDiv);
    }   

  
    //funcion para ver en mapa la posicion
   function PrintUbi(cont){
    
    var ubi= document.getElementById('ubi'+cont).textContent;
    var newUbi=ubi.split(' ');
    
                var name= document.getElementById('name'+cont).textContent;
                
                var tieme= document.getElementById('time'+cont).textContent;
                var text= 'Exepcion: '+name+ '\nTiempo: '+tieme;
                
                var colorIcon = new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  });

    const markertPint= L.marker([newUbi[0],newUbi[1]],{icon:colorIcon}).addTo(map).bindPopup(text);
    map.fitBounds([
        [markertPint.getLatLng().lat, markertPint.getLatLng().lng]
    ]);

        
   }