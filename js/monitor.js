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

socket.on('updateMonitor2', function (data) {
  const elements = document.querySelectorAll("p");
  const filterElements = Array.from(elements)
  .filter((element)=> element.textContent === data);
  filterElements[0].remove()
});

socket.on('order_share', (message) => {
  orders = test(message);
  outputQue(message)
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

  function outputQue(orderes) {
    orders.forEach(order => {
      if (order["flag"] == 0) {
        document.querySelector("#que").insertAdjacentHTML('beforeend', "<p>"+ order["orderID"] +"</p>")
      } else if (order["flag"] == 1) {
        document.querySelector("#complete").insertAdjacentHTML('beforeend', "<p>"+ order["orderID"] +"</p>")
      } else if (order["flag"] == 2 || order["flag"] == 99) {
      }
    });
  }
  