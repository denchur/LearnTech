const order = document.querySelectorAll(".order");
    // orderActived = document.querySelectorAll('.order#actived'),
    // orderCompleted = document.querySelectorAll('.order#completed'),
    // btnOrderAll = document.querySelector('#btnOrderAll'),
    // btnOrderActived = document.querySelector('#btnOrderActived'),
    // btnOrderCompleted = document.querySelector('#btnOrderCompleted');

    // btnOrderAll.addEventListener('click',(event)=>{
    //   event.preventDefault();
    //   order.forEach((el)=>{
    //     el.classList.remove('hidden');
    //   });
    //   btnOrderAll.classList.add('active');
    //   btnOrderActived.classList.remove('active');
    //   btnOrderCompleted.classList.remove('active');
    // });

    // btnOrderActived.addEventListener('click',(event)=>{
    //   event.preventDefault();
    //   order.forEach((el)=>{
    //     el.classList.add('hidden')
    //   })
    //   orderActived.forEach((el)=>{
    //     el.classList.remove('hidden');
    //   });

    //   btnOrderAll.classList.remove('active');
    //   btnOrderActived.classList.add('active');
    //   btnOrderCompleted.classList.remove('active');
    // });

    // btnOrderCompleted.addEventListener('click',(event)=>{
    //   event.preventDefault();
    //   order.forEach((el)=>{
    //     el.classList.add('hidden')
    //   })
    //   orderCompleted.forEach((el)=>{
    //     el.classList.remove('hidden');
    //   });

    //   btnOrderAll.classList.remove('active');
    //   btnOrderActived.classList.remove('active');
    //   btnOrderCompleted.classList.add('active');
    // });




// ============================================================================
// ========================= Подробнее ========================================
// ============================================================================


const chevron = document.getElementById('chevron'),
      details = document.getElementById('details');

// for (let i = 0; i < chevron.length; i++){
//   chevron[i].addEventListener('click', ()=>{
//     details[i].classList.toggle('show');
//     order[i].classList.toggle('show');
//     chevron[i].classList.toggle('active');

//   })
// }


// ============================================================================
// ========================= Яндекс Карты =====================================
// ============================================================================

// let center = [51.29739702582067,37.83455459560286];

// function init() {
// 	let map = new ymaps.Map('map', {
// 		center: center,
// 		zoom: 17
// 	});

// 	let placemark = new ymaps.Placemark(center, {}, {
// 		iconLayout: 'default#image',
// 		iconImageHref: 'https://image.flaticon.com/icons/png/512/64/64113.png',
// 		iconImageSize: [40, 40],
// 		iconImageOffset: [-19, -44]
// 	});

// 	// map.controls.remove('geolocationControl'); // удаляем геолокацию
//   map.controls.remove('searchControl'); // удаляем поиск
//   // map.controls.remove('trafficControl'); // удаляем контроль трафика
//   map.controls.remove('typeSelector'); // удаляем тип
//   // map.controls.remove('fullscreenControl'); // удаляем кнопку перехода в полноэкранный режим
//   map.controls.remove('zoomControl'); // удаляем контрол зуммирования
//   map.controls.remove('rulerControl'); // удаляем контрол правил
// }

// ymaps.ready(init);
function activateMaps(pacient, pharmacy ) {
  let mapElement = document.getElementById('map');
  mapElement.innerHTML = ''; // Очистка содержимого элемента

  ymaps.ready(function () {
    let myMap = new ymaps.Map('map', {
      center: [51.29739702582067, 37.83455459560286],
      zoom: 15,
      controls: ['routePanelControl']
    });

  let control = myMap.controls.get('routePanelControl');
  let city = City;
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log(pacient);

  // let location = ymaps.geolocation.get();

  // location.then(function(res) {
  // 	let locationText = res.geoObjects.get(0).properties.get('text');
  // 	console.log(locationText)
  // });

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
  function success(pos) {
    const crd = pos.coords;
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);


    let reverseGeocoder = ymaps.geocode([crd.latitude, crd.longitude]);
    let locationText = null;
    reverseGeocoder.then(function (res) {
      locationText = res.geoObjects.get(0).properties.get('text')
      console.log(locationText)
      if ((!pacient) && (!pharmacy) ){
        alert('Для построения маршрута заполните данные формы \n или постройте маршрут по заказу');
      }
      else if ((pacient) && (pharmacy))  {
        pacient +=City;
        pharmacy += City;
      control.routePanel.state.set({
        type: 'masstransit',
        fromEnabled: false,
        from: locationText,
        toEnabled: true,
        to: `${pacient}`,
      });
    }
    });
  
    control.routePanel.options.set({
      types: {
        auto: true,
        masstransit: true,
        pedestrian: true,
        taxi: true
      }
    })
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);



});
};