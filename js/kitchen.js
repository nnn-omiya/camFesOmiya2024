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

function test(orders) {
const mergedOrders = orders.reduce((acc, current) => {
  const { orderID, item, quantity, flag} = current;
  
  // 既存の orderID があるか確認
  let existingOrder = acc.find(order => order.orderID === orderID);
  
  if (existingOrder) {
    // 同じ商品名がある場合、数量を加算
    let existingItem = existingOrder.items.find(i => i.item === item);
    if (existingItem) {
      existingItem.quantity += parseInt(quantity, 10);
    } else {
      // 新しい商品名の場合、追加
      existingOrder.items.push({ item, quantity: parseInt(quantity, 10) });
    }
  } else {
    // orderID が存在しない場合、新しいエントリを作成
    acc.push({
      orderID: orderID,
      items: [{ item, quantity: parseInt(quantity, 10) }],
      flag: flag
    });
  }
  
  return acc;
}, []);
return mergedOrders;
}

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
  console.log(orders);
  orders.forEach((order) => {
    html += '<tr>';
    html += '<td>'+ order["orderID"] +'</td>'
    html += '';
    order.items.forEach(item => {
      html += '<td>'+ item["quantity"] +'個</td>'
    });
    html += '<td><a onclick="serve(\''+ order["orderID"] +'\')" class="serve-btn btn btn-outline-success btn-sm">提供可能</a></td>'
    html += '</tr>';
  });
  console.log(html)
  document.querySelector("#main-table").insertAdjacentHTML('beforeend', html)
}

function serve(orderID) {
  socket.emit('available', orderID);
}

socket.on('connected', function (data) {
  console.log(data);
});
socket.on('disconnect', function (data) {
  //console.log(data);
  socket.disconnect();
});
socket.on('order_share', (message) => {
  console.log(message)
  insertTable(message)
});
