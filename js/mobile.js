const socket = io.connect(`http://${server_address}:8080`, { transports: [ 'websocket' ] });

function App() {
  const [menuItems, setMenuItems] = React.useState([
    { name: 'ミルクティー', price: 200 },
    { name: 'アイスティー', price: 200 },
    { name: '紅茶', price: 200 },
  ]);
  const [order, setOrder] = React.useState(
    menuItems.map(item => ({ item: item.name, quantity: 0 }))
  );
  const [total, setTotal] = React.useState(0);


  React.useEffect(() => {
    fetch(`${api_url}/getprice`)
      .then((response) => {
        return response.json()
      })
      .then((result) => {
        setMenuItems(result)
        addButton()
      })
      .catch((e) => {
        console.log(e)
      });
  }, [])

  React.useEffect(() => {
    console.log(order);
    setTotal(order.reduce((sum, item) => {
      const price = menuItems.find(menuItem => menuItem.name === item.item).price;
      return sum + price * item.quantity
    }, 0));
  }, [order]);

  function handleOrder() {
    const data = [{ type: "pos" }];
    setOrder([]);
    if (order.reduce((sum, item) => sum + item.quantity, 0) > 0) {
      data.push(...order);
    socket.emit('order', JSON.stringify(data));
    console.log(JSON.stringify(data));
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">イノキャン紅茶店()</h1>
      <AccordionMenu
        menuItems={menuItems}
        order={order}
        setOrder={setOrder}
      />
      <footer>
        <p>合計金額： {total}円</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          onClick={handleOrder}
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls="hs-modal-upgrade-to-pro"
          data-hs-overlay="#hs-modal-upgrade-to-pro"
        >
          注文する
        </button>
      </footer>
    </div>
  );
}

function AccordionMenu(props) {
  const { menuItems, order, setOrder } = props;
  const [target, setTarget] = React.useState(null);

  function handleInc(name) {
    const updatedOrder = order.map(item =>
      item.item === name ? { ...item, quantity: item.quantity + 1 } : item
    );
    setOrder(updatedOrder);
  }

  function handleDec(name) {
    const updatedOrder = order.map(item =>
      item.item === name && item.quantity > 0
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setOrder(updatedOrder);
  }

  function handleToggle(name) {
    setTarget(target === name ? null : name);
  }

  return (
    <div>
      {menuItems.map((item, index) => (
        <AccordionItem
          key={index}
          name={item.name}
          price={item.price}
          quantity={order.find(orderItem => orderItem.item === item.name)?.quantity || 0}
          onInc={() => handleInc(item.name)}
          onDec={() => handleDec(item.name)}
          onClick={() => handleToggle(item.name)}
          isOpen={target === item.name}
        />
      ))}
    </div>
  );
}

function AccordionItem(props) {
  const { name, price, quantity, onInc, onDec, onClick, isOpen } = props;

  return (
    <div className="border-b py-2">
      <div onClick={onClick} className="flex justify-between cursor-pointer">
        <span className="text-lg">{name}</span>
        <span className="text-lg">{price}円</span>
      </div>
      {isOpen && (
        <div className="mt-2 flex items-center">
          <button onClick={onDec} className="px-2 py-1 border rounded-l">
            －
          </button>
          <span className="px-4">{quantity}</span>
          <button onClick={onInc} className="px-2 py-1 border rounded-r">
            ＋
          </button>
        </div>
      )}
      <div onClick={onClick} className="mt-2">
        <span>数量: {quantity}  </span>
        <span>小計: {price * quantity}円</span>
      </div>
    </div>
  );
}

socket.on('order_end', function (data) {
  blockUI.closeOverlayAsync();
  // toastr.success('注文が完了しました', '注文完了')
  // todo: ログを表示
  console.log(data.orderID);
});

console.log("Hello from React");
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
