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
  html += '</tr>';
  html += '</thead>';
  document.querySelector("#main-table").insertAdjacentHTML('afterbegin', html)
}

function insertTable(orders) {
  html = "";
  //console.log(orders);
  orders.forEach((order) => {
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
    html += '</tr>';
  });
  //console.log(html)
  document.querySelector("#main-table").insertAdjacentHTML('beforeend', html)
}