const server_address = "10.8.100.117"
const api_url = `http://${server_address}:8080`;

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