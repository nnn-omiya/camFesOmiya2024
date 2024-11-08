document.addEventListener("dblclick", function(e){ e.preventDefault();}, { passive: false });

var socket = io.connect('http://'+ server_address +':8080', { transports: [ 'websocket' ] });

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

async function send_data(e) {
  e.preventDefault();
  //代金を受け取ったかポップアップを出す

  //代金を受け取っていれば送信する
  let data = [];
  data.push({type: "pos"})
  Array.from(document.getElementById("menus").children).forEach((a) => {
    let amount = a.querySelectorAll(".amount")[0];
    data.push({item: amount.dataset.name, quantity: amount.value})
  });
  //console.log(JSON.stringify(data))

  blockUI.showOverlayAsync();
  socket.emit('order', JSON.stringify(data));
  audio.src='ok.mp3';
  audio.play(); //audioを再生
}

function recalc() {
  const amounts = document.querySelectorAll(".menu > .input-group > input");
  const prices = document.querySelectorAll(".menu > input");

  return [...amounts].reduce((sum, amount, i) => {
    return sum + parseInt(amount.value) * parseInt(prices[i].value);
  }, 0);
}

function clearAll() { //支払金額の計算
  let amounts = document.querySelectorAll(".menu > .input-group > input");
  for (let i = 0; i < amounts.length; i += 1) { amounts[i].value = 0; }
}

// 親要素を指定
const parentElement = document.querySelector('#menus');
let lastfocus;

// 親要素にフォーカスイベントを設定（フォーカスされる子要素にのみ適用される）
parentElement.addEventListener('focusin', (event) => {
  if (event.target.classList.contains('amount')) {
    event.preventDefault();
    lastfocus = document.activeElement;
  }
});

//テンキー
document.querySelector('#keypad').addEventListener('click', (event) => {
  if (event.target.classList.contains('pad_btn')) {
    if(event.target.value != "CK" && event.target.value != "CA") {
      lastfocus.value = parseInt(lastfocus.value + event.target.value); //inputのvalueを書き換え
    } else if (event.target.value == "CK"){
      //フォーカスされている要素の値を0にする
      lastfocus.value = 0; //クリアキー
    } else if (event.target.value == "CA"){
      //クリアオール処理
      clearAll();
    }
    $("#total").text(recalc()+"円");
  }
});

socket.on('order_end', function (data) {
  blockUI.closeOverlayAsync(); 
  toastr.success('注文が完了しました', '注文完了')
  //console.log(data.orderID);
});