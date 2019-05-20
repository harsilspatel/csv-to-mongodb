const packAndReport = require('./knapsack');

const testWeight = (weight, orders, byOId) =>
  (orders.map(id => byOId[id]['weight']).reduce((t, a) => t + a, 0) <= weight);


const byOrderId = (orders) => {
  const orderObj = {};
  orders.forEach(o => (orderObj[o.orderId] = o));
  return orderObj
}

function groupBy(array, fn) {
  const group = {};
  array.forEach(element => {
    const key = fn(element);
    if (!(key in group)) {
      group[key] = [];
    }
    group[key].push(element);
  });
  return group;
}

const byCustomerId = (orders) => groupBy(orders, x => x.customerId);

const orderIdToVanId = (vans) => { //returns { def: 1, zzz: 1, ghi: 2, mno: 2, rst: 2, abc: 3 } for exampleOrders
  const myObj = {}
  for (let i = 0; i < vans.length; i++) {
    vans[i].orders.forEach(oId => myObj[oId] = i+1)
  }
  return myObj;
}


const exampleOrders = [
  {
    customerId: 1,
    orderId: 'abc',
    weight: 2
  },
  {
    customerId: 2,
    orderId: 'ghi',
    weight: 1
  },
  {
    customerId: 1,
    orderId: 'def',
    weight: 4
  },
  {
    customerId: 1,
    orderId: 'zzz',
    weight: 1
  },
  {
    customerId: 2,
    orderId: 'mno',
    weight: 2
  },
  {
    customerId: 3,
    orderId: 'rst',
    weight: 2
  }
];

function testKnapsack(orders, weight) {
  const result = packAndReport(orders, weight);
  groupByOrderId = byOrderId(orders);
  const allPassing = result.vans.every(item => testWeight(weight, item.orders, groupByOrderId));
  if (!(allPassing)) {
    throw new Error('not all the orders abide by the weight constraints');
  }

  const orderIdToVanIdObj = orderIdToVanId(result.vans);
  console.log(orderIdToVanIdObj);





}


testKnapsack(exampleOrders, 5)

// console.log(byOrderId(exampleOrders));
