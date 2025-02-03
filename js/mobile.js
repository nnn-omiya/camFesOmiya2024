const socket = io.connect(server_address, { transports: [ 'websocket' ] });

function App() {
  const [menuItems, setMenuItems] = React.useState([]);
  const [order, setOrder] = React.useState(initialOrder());
  const [total, setTotal] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
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
      if (!isComplete) {
        socket.emit('order', JSON.stringify(data));
        setIsComplete(true);
      }
      console.log(JSON.stringify(data));
    }
  }

  socket.on('order_end', (data) => {
    if (data.orderID != orderID) {
      setOrderID(data.orderID);
    }
    console.log(data.orderID);
  });

  return (
    <div className="p-4 relative w-screen h-dvh">
      {orderID === "0" ? (
        <div className="w-full h-full">
          <h1 className="text-xl font-bold mb-4">ヴィクトリア半自動紅茶</h1>
          <p>このオーダーは<span className="text-red-500">8階</span>にお届けします。</p>
          <AccordionMenu
            menuItems={menuItems}
            order={order}
            setOrder={setOrder}
          />
          <footer className="fixed bottom-0 inset-x-px mx-2 flex items-center justify-between bg-gray-100 p-4 shadow">
            <p className="text-lg font-semibold text-gray-800">合計金額： {total}ガリオン</p>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors"
              onClick={handleOrder}
            >
              注文する
            </button>
          </footer>
        </div>
      ): (
        <div className="w-full h-full p-6 bg-white shadow-md">
          <h3 className="text-2xl font-bold text-green-600">注文を受け付けました。</h3>
          <h3 className="text-2xl text-green-600">注文番号：<span className="text-3xl">{orderID}</span>です。</h3>
          <h4 className="mt-4 text-xl font-semibold">あなたの注文内容</h4>
          <h5 className="mt-2 text-lg">合計金額： {total}ガリオン</h5>
          <ul className="mt-2 list-disc list-inside">
            {order.map(item => item.quantity !== 0 ? (
              <li key={item.item} className="py-1">
                {item.item} x {item.quantity}
              </li>
            ) : null)}
          </ul>
          <p className="mt-4 text-sm text-gray-700">
            <span className="text-red-500">8階の飲食スペースにあるモニター付近</span>でモバイルオーダーの受け渡しを行います。<br />
            この画面を受け渡し係に提示していただくことで受け渡しが完了します。
          </p>
        </div>
      )}
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
    <div className="border-b">
      <div
        onClick={onClick}
        className="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-100"
      >
        <span className="text-lg font-semibold">{name}</span>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">@ {price}ガリオン</span>
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center">
            <button onClick={onDec} className="px-3 py-1 border rounded-l">
              －
            </button>
            <span className="px-4 text-lg">{quantity}</span>
            <button onClick={onInc} className="px-3 py-1 border rounded-r">
              ＋
            </button>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span>数量: {quantity}個</span>
            <span>小計: {price * quantity}ガリオン</span>
          </div>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
