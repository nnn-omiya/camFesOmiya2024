const socket = io.connect(`//${server_address}:8080`, { transports: [ 'websocket' ] });

function App() {
  const [menuItems, setMenuItems] = React.useState([]);
  const [order, setOrder] = React.useState(initialOrder());
  const [total, setTotal] = React.useState(0);
  const [orderID, setOrderID] = React.useState("0");

  React.useEffect(() => {
    fetch(`${api_url}/getprice`)
      .then((response) => {
        return response.json()
      })
      .then((result) => {
        console.log(result)
        setMenuItems(result)
        console.log(result)
      })
      .catch((e) => {
        console.log(e)
      });
  }, [])

  React.useEffect(() => {
    console.log("order changed");
    console.log(order);
    console.log(menuItems);
    setTotal(order.reduce((sum, item) => {
      const price = menuItems.find(menuItem => menuItem.name === item.item).price;
      return sum + price * item.quantity
    }, 0));
  }, [order]);
  React.useEffect(() => {
    setOrder(initialOrder());
  }, [menuItems])

  function initialOrder() {
    return menuItems.map(item => ({ item: item.name, quantity: 0 }));
  }

  function handleOrder() {
    const data = [{ type: "mobile" }];
    if (order.reduce((sum, item) => sum + item.quantity, 0) > 0) {
      data.push(...order);
      socket.emit('order', JSON.stringify(data));
      console.log(JSON.stringify(data));
    }
    setOrder(initialOrder());
  }

  socket.on('order_end', (data) => {
    setOrderID(data.orderID);
    console.log(data.orderID);
  });

  return (
    <div className="p-4 relative w-screen h-screen">
      <h1 className="text-xl font-bold mb-4">イノキャン紅茶店()</h1>
      <AccordionMenu
        menuItems={menuItems}
        order={order}
        setOrder={setOrder}
      />
      <footer className="absolute bottom-0 flex items-center py-px w-screen inset-x-0 my-3">
        <p className="flex items-center justify-center text-center h-100 mx-5">合計金額： {total}ガリオン</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mx-px my-auto"
          onClick={handleOrder}
          aria-haspopup="dialog"
          aria-expanded="false"
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
        <span className="text-lg">@ {price}ガリオン</span>
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
        <span>数量: {quantity}個  </span>
        <span>小計: {price * quantity}ガリオン</span>
      </div>
    </div>
  );
}

console.log("Hello from React");
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
