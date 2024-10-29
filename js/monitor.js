var socket = io.connect('http://'+ server_address +':8080', { transports: [ 'websocket' ] });

socket.on('connected', function (data) {
  console.log(data);
});
socket.on('disconnect', function (data) {
  //console.log(data);
  socket.disconnect();
});
socket.on('updateMonitor', function (data) {
  let complete = document.querySelector("#complete");
  let result = Array.from(document.querySelectorAll("#que > p")).filter(td => td.innerText === data)[0]
  complete.appendChild(result)
  console.log(data);
});

//ここでFetchなどをする
fetch(api_url + "/getorder")
  .then((response) => {
    return response.json()
  })
  .then((result) => {
    orders = test(result);
    outputQue(orders);
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

  function outputQue(orderes) {
    orders.forEach(order => {
      if (order["flag"] == 0) {
        document.querySelector("#que").insertAdjacentHTML('beforeend', "<p>"+ order["orderID"] +"</p>")
      } else if (order["flag"] == 1) {
        document.querySelector("#complete").insertAdjacentHTML('beforeend', "<p>"+ order["orderID"] +"</p>")
      }
    });
  }
  