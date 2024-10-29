window.addEventListener("load", btnBlockUI_onclick);

async function btnBlockUI_onclick() {
  try {
    await blockUI.showOverlayAsync();

    //ここでFetchなどをする
    fetch(api_url+"/getprice")
      .then((response) => {
        return response.json()
      })
      .then((result) => {
        //console.log(result)
        result.forEach((element) => {
          addMenu(element)
        });
        addButton()
      })
      .catch((e) => {
          console.log(e)  //エラーをキャッチし表示
      });
    await blockUI.closeOverlayAsync();
  } finally {
    await blockUI.closeOverlayAsync();
  }
}

function addButton() {
  $('.amount').bootstrapNumber({
    // default, danger, success , warning, info, primary
    upClass: 'danger',
    downClass: 'success'
  });
};

function addMenu(data) {
  let menus = document.getElementById("menus")
  let template = document.getElementById("menu-template");
  let menuA = document.importNode(template.content, true)
  menuA.querySelector("label").innerText = data.name
  menuA.querySelector("input").dataset.name = data.name
  menuA.querySelector("p").innerText = "@"+data.price+"円"
  menuA.getElementById("price").value = parseInt(data.price)
  menus.appendChild(menuA)
}

function send_data(e) {
  e.preventDefault();
  //代金を受け取ったかポップアップを出す

  //代金を受け取っていれば送信する
  let data = [];
  data.push({type: "mobile"})
  Array.from(document.getElementById("menus").children).forEach((a) => {
    let amount = a.querySelectorAll(".amount")[0];
    data.push({item: amount.dataset.name, quantity: amount.value})
  });
  console.log(JSON.stringify(data))
  fetch(api_url+"/order", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) 
  })
  //そうでなければイベントを差し戻す
}