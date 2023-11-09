function sendLoginForm(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get the form data
    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;
    var token;
    // Create the request body
    const requestBody = {
        email: email,
        password: password
    };

    // Send the request
    fetch('http://127.0.0.1:8000/api/auth/token/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response data
        token = data['auth_token']
        localStorage.setItem('auth_token', token);
        console.log(token);
    })
    .catch(error => {
        // Handle any errors
        console.error(error);
    });
}
const my_body = document.getElementById('my_body');
const ordersList = document.getElementById('order-group-all');
const ordersGetBtn = document.getElementById('ordersGet');
const ordersMyBtn = document.getElementById('ordersMy');
const ordersMyFinishBtn = document.getElementById('ordersMyReady');
const state = {
    orders: [],
    my_orders: [],
    finish: [],
};
const profilName = document.getElementById('profilName');
const profilLastName = document.getElementById('profilLastName');
const workCity = document.getElementById('workCity');
const profilNumber = document.getElementById('profilNumber');
const profilGetedOrders = document.getElementById('profilGetedOrders');
const profilReadyOrders = document.getElementById('profilReadyOrders');
const profilRefuceOrders = document.getElementById('profilRefuceOrders');
var City;
var pharmacy_address;
var pacient_address;

function handleOrdersMyReadyBtnButtonClick() {
    getMyFinishOrdersRequest()
        .then(() => {
            fillFinishOrdersList(state.finish);
        })
        .catch((error) => {
            console.error('Ошибка при получении заказов:', error);
        });
};

function handleMyOrdersButtonClick() {
    getMyOrdersRequest()
        .then(() => {
            fillMyOrdersList(state.my_orders);
        })
        .catch((error) => {
            console.error('Ошибка при получении заказов:', error);
        });
}
function handleOrdersButtonClick() {
    getOrdersRequest()
        .then(() => {
            fillOrdersList(state.orders);
        })
        .catch((error) => {
            console.error('Ошибка при получении заказов:', error);
        });
}

ordersGetBtn.addEventListener('click', handleOrdersButtonClick)

ordersMyBtn.addEventListener('click', handleMyOrdersButtonClick)

ordersMyFinishBtn.addEventListener('click', handleOrdersMyReadyBtnButtonClick)

document.addEventListener('DOMContentLoaded', async() => {
    await getOrdersRequest();
    fillOrdersList(state.orders);
    getMyProfil();
});
const createOrders = (order) => `
    <div class="order" id="actived">
        <div class="title-order">
            <span class="title">Заказ №${order.id}</span>
            <img class="chevron" src="img/chevron-down-regular-24.png" alt="chevron" id="chevron">
        </div>
        <span class="subtitle">${order.status}</span>
        <div class="address-order">
            <img src="img/map-solid-24.png" alt="map"></img>
            <span class="short_address">${order.address_pacient}</span>
        </div>
        <div class="apteka">
            <img src="img/plus-medical-regular-24.png" alt="apteka">
            <span class="address__apteka">${order.from_the_pharmacy.address} «${order.from_the_pharmacy.name}»</span>
        </div>
        <div class="select">
            <button class="complete" onclick="takeOrder(${order.id})"><img src="img/check-regular-24.png" alt="check"></button>
            <button class="cancel" onclick="refuseOrderHomePage(${order.id})"><img src="img/x-regular-24.png" alt="x"></button>
        </div>
    </div>
`;

const createMyOrders = (order) => {
    let buttonBlock = '';
    if (order.status === 'В ожидании') {
        buttonBlock = `
        <div class="select">
                <button  onclick="pickupPharmacy(${order.id})">Забрать из аптеки</button>
                <button class="cancel" onclick="refuseOrder(${order.id})"><img src="img/x-regular-24.png" alt="x"></button>
            </div>
        `;
    }
    else if (order.status === 'В обработке') {
        buttonBlock = `
        <button onclick="activateMaps('${order.address_pacient}','${order.from_the_pharmacy.address}')" class="plot__course">Построить маршрут</button>
        <div class="select">
                <button  onclick="giveRecipient(${order.id})">Вручить получателю</button>
            </div>
        `;
    }
    return `
<div class="order" id="${order.id}order">
    <div class="title-order">
        <span class="title">Заказа ${order.id}</span>
        <img onclick="showDetail(${order.id})" class="chevron" src="img/chevron-down-regular-24.png" alt="chevron" id="${order.id}chevron">
    </div>
    <span class="subtitle">${order.status}</span>
    <div class="address-order">
        <img src="img/map-solid-24.png" alt="map">
        <span class="short_address">${order.address_pacient}</span>
    </div>
    <div class="apteka">
            <img src="img/plus-medical-regular-24.png" alt="apteka">
            <span class="address__apteka">${order.from_the_pharmacy.address} «${order.from_the_pharmacy.name}»</span>
        </div>
    <div class="details" id="${order.id}details">

        <div class="patient">
            <span class="title">Заказчик:</span>
            <div class="patient__name">
                <img src="img/user-solid-24.png" alt="user">
                <span class="name">Имя: ${order.recipients_name}</span>
            </div>
            <div class="patient__phone">
                <img src="img/phone-solid-24.png" alt="phone">
                <span class="phone">Телефон: ${order.recipients_phone}</span>
            </div>
        </div>

        <div class="info__order">
            <div class="order__contents__title">
                <img src="img/package-regular-24.png" alt="package">
                <span class="order__contents">Содержимое заказ:</span>
            </div>
            <ul
            ${order.medication.map(med => `<li>${med.name} - ${med.quantity} шт.</li>`).join('')}
            </ul>
        </div>  
        ${buttonBlock}
        </div>
    </div>
`;
};
const createFinishOrders = (order) => `
    <div class="order" id="completed">
        <div class="title-order">
            <span class="title">Заказ ${order.id}</span>
            <img class="chevron" src="img/chevron-down-regular-24.png" alt="chevron" id="chevron">
        </div>
        <span class="subtitle">${order.status}</span>
        <div class="address-order">
            <img src="img/map-solid-24.png" alt="map"></img>
            <span class="short_address">${order.address_pacient}</span>
        </div>
        <div class="apteka">
            <img src="img/plus-medical-regular-24.png" alt="apteka">
            <span class="address__apteka">${order.from_the_pharmacy.address} «${order.from_the_pharmacy.name}»</span>
        </div>
    </div>
`;
const fillOrdersList = (orders) => {
    ordersList.innerHTML ="";
    orders.forEach((order) => ordersList.innerHTML += createOrders(order));
    orders.splice(0);
}

const fillFinishOrdersList = (orders) => {
    ordersList.innerHTML ="";
    orders.forEach((order) => ordersList.innerHTML += createFinishOrders(order));
    orders.splice(0);
}



const fillMyOrdersList = (orders) => {
    ordersList.innerHTML ="";
    orders.forEach((order) => ordersList.innerHTML += createMyOrders(order))
    orders.splice(0);
}

function showDetail(id){
    const detail_div = document.getElementById(id+'details');
    const order_div = document.getElementById(id +'order');
    const chevron_div = document.getElementById(id+'chevron');
    if (detail_div.className == "details show") {
        detail_div.className = "details";
        order_div.className = "order";
        chevron_div.className = "chevron";
    }
    else {
        detail_div.className = "details show";
        order_div.className = "order show";
        chevron_div.className = "chevron active";
    }
};
function giveRecipient(order_id) {
    const token = localStorage.getItem('auth_token');
    let acceptKod = prompt("Введите код подтверждения", "0000");
    if (acceptKod != null) {
      let requestData = {
        acceptCode: parseInt(acceptKod)
      };
  
      return fetch(`http://127.0.0.1:8000/api/orders/${order_id}/give_to_the_recipient/`, {
        method: 'POST',
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(requestData)
      })
        .then((res) => res.json())
        .then((result) => {
          alert(result['action']);
        });
    }
  }


function pickupPharmacy(order_id){
    const token = localStorage.getItem('auth_token');
    return fetch(`http://127.0.0.1:8000/api/orders/${order_id}/pickup_pharmacy/`, {
       method: 'POST',
       headers: {
          "Content-type": "application/json; charset=UTF-8",
          'Authorization': `Token ${token}`
       }
    })
    .then((res) => res.json())
    .then(
        (result) => {
            console.log(result);
           alert(result['action']);
           handleMyOrdersButtonClick();
        }
    )
 }



function getOrdersRequest() {
    const token = localStorage.getItem('auth_token');
    return fetch('http://127.0.0.1:8000/api/orders/', {
       method: 'GET',
       headers: {
          "Content-type": "application/json; charset=UTF-8",
          'Authorization': `Token ${token}`
       }
    })
    .then((res) => res.json())
    .then(
        (orders) => {
            state.orders = state.orders.concat(orders['results']);
        }
    )
 }



 function takeOrder(order_id) {
    const token = localStorage.getItem('auth_token');
    return fetch(`http://127.0.0.1:8000/api/orders/${order_id}/take_order/`, {
       method: 'POST',
       headers: {
          "Content-type": "application/json; charset=UTF-8",
          'Authorization': `Token ${token}`
       }
    })
    .then((res) => res.json())
    .then(
        (result) => {
           alert(result['action']);
           handleOrdersButtonClick();
        }
    )
 }

 function refuseOrderHomePage(order_id) {
    var result = confirm('Вы уверены, что хотите отказаться от заказа');
    if (result){
    const token = localStorage.getItem('auth_token');
    return fetch(`http://127.0.0.1:8000/api/orders/${order_id}/refuce_order/`, {
       method: 'POST',
       headers: {
          "Content-type": "application/json; charset=UTF-8",
          'Authorization': `Token ${token}`
       }
    })
    .then((res) => res.json())
    .then(
        (result) => {
           alert(result['action']);
           handleOrdersButtonClick();
        }
    )
 }
}

 function refuseOrder(order_id) {
    const token = localStorage.getItem('auth_token');
    return fetch(`http://127.0.0.1:8000/api/orders/${order_id}/refuce_order/`, {
       method: 'POST',
       headers: {
          "Content-type": "application/json; charset=UTF-8",
          'Authorization': `Token ${token}`
       }
    })
    .then((res) => res.json())
    .then(
        (result) => {
           alert(result['action']);
           handleMyOrdersButtonClick();
        }
    )
 }
 


 function getMyOrdersRequest(){
 const token = localStorage.getItem('auth_token');
    return fetch('http://127.0.0.1:8000/api/orders/my_orders/', {
       method: 'GET',
       headers: {
          "Content-type": "application/json; charset=UTF-8",
          'Authorization': `Token ${token}`
       }
    })
    .then((res) => res.json())
    .then(
        (orders) => {
            console.log(orders);
            state.my_orders = state.my_orders.concat(orders);
        }
    )
 }


 function getMyProfil(){
    const token = localStorage.getItem('auth_token');
       return fetch('http://127.0.0.1:8000/api/users/me', {
          method: 'GET',
          headers: {
             "Content-type": "application/json; charset=UTF-8",
             'Authorization': `Token ${token}`
          }
       })
       .then((res) => res.json())
       .then(
           (orders) => {
               console.log(orders);
               profilName.innerHTML = orders['first_name'];
               profilLastName.innerHTML = orders['last_name'];
               profilGetedOrders.innerHTML = orders['count_geted_orders']; 
               profilReadyOrders.innerHTML = orders['count_ready_orders'];
               profilRefuceOrders.innerHTML = orders['count_refuce_orders'];
               console.log(orders['work_in_city']);
               workCity.innerHTML = orders['work_in_city'];
               City = orders['work_in_city'];
           }
       )
    }

    function getMyFinishOrdersRequest(){
        const token = localStorage.getItem('auth_token');
           return fetch('http://127.0.0.1:8000/api/orders/my_finish_orders/', {
              method: 'GET',
              headers: {
                 "Content-type": "application/json; charset=UTF-8",
                 'Authorization': `Token ${token}`
              }
           })
           .then((res) => res.json())
           .then(
               (orders) => {
                   console.log(orders);
                   state.finish = state.finish.concat(orders);
               }
           )
        }

