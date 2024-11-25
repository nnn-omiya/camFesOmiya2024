document.addEventListener("dblclick", function(e){ e.preventDefault();}, { passive: false });

var socket = io.connect('http://'+ server_address +':8080', { transports: [ 'websocket' ] });

  //ここでFetchなどをする
  fetch(api_url+"/getorder")
    .then((response) => {
      return response.json()
    })
    .then((result) => {
      orders = test(result);
      insertHeader(orders[orders.length-1].items)
      insertTable(orders);
    })
    .catch((e) => {
        console.log(e)  //エラーをキャッチし表示
    });

function insertHeader(data) {
  let html = "";
  html += '<thead class="thead-dark">';
  html += '<tr>';
  html += '<th>注文番号</th>'
  data.forEach(element => {
    html += '<th>' + element["item"] + '</th>';
  });
  html += '<th>提供ボタン</th>'
  html += '</tr>';
  html += '</thead>';
  document.querySelector("#main-table").insertAdjacentHTML('afterbegin', html)
}

function insertTable(orders) {
  html = "";
  //console.log(orders);
  orders.forEach((order) => {
    if (order["flag"] == 2) { return }
    html += '<tr>';
    html += '<td>'+ order["orderID"] +'</td>'
    html += '';
    order.items.forEach(item => {
      if (item["quantity"] != 0) {
        html += '<td>'+ item["quantity"] +'個</td>'
      } else {
        html += '<td></td>'
      }
    });
    if (order["flag"] == 0) { html += '<td><a onclick="serve(\''+ order["orderID"] +'\')" class="serve-btn btn btn-outline-success btn-sm">提供可能</a></td>' }
    if (order["flag"] == 1) { html += '<td><a onclick="complete(\''+ order["orderID"] +'\')" class="serve-btn btn btn-outline-success btn-sm">受け渡しました</a></td>' }
    html += '</tr>';
  });
  //console.log(html)
  document.querySelector("#main-table").insertAdjacentHTML('beforeend', html)
}

function serve(orderID) { //提供可能ボタンを押した時
  const elements = document.querySelectorAll("td");
  const filterElements = Array.from(elements)
  .filter((element)=> element.textContent === orderID);
  let button = filterElements[0].parentElement.querySelector(".serve-btn");
  button.setAttribute('onclick', `complete("${orderID}")`);
  button.innerText = "受け渡しました"
  socket.emit('available', orderID);
}

function complete(orderID) {
  const elements = document.querySelectorAll("td");
  const filterElements = Array.from(elements)
  .filter((element)=> element.textContent === orderID);
  filterElements[0].parentElement.remove();
  socket.emit('complete', orderID);
}

socket.on('connected', function (data) {
  console.log(data);
});
socket.on('disconnect', function (data) {
  //console.log(data);
  socket.disconnect();
});
socket.on('order_share', (message) => {
  audio.src='./res/ok.mp3';
  audio.play(); //audioを再生
  insertTable(message)
});

socket.on('updateMonitor', function (data) {
  const elements = document.querySelectorAll("td");
  const filterElements = Array.from(elements)
  .filter((element)=> element.textContent === data);
  let button = filterElements[0].parentElement.querySelector(".serve-btn");
  button.setAttribute('onclick', `complete("${data}")`);
  button.innerText = "受け渡しました"
});

//受け渡し済みのときのやつ
socket.on('updateMonitor2', function (data) {
  const elements = document.querySelectorAll("td");
  const filterElements = Array.from(elements)
  .filter((element)=> element.textContent === data);
  filterElements[0].parentElement.remove();
  socket.emit('complete', orderID);
});