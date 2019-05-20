const packAndReport = require('./knapsack');

const testWeight = (weight, orders, byOId) =>
  orders.map(id => byOId[id]['weight']).reduce((t, a) => t + a, 0) <= weight;

const byOrderId = orders => {
  const orderObj = {};
  orders.forEach(o => (orderObj[o.orderId] = o));
  return orderObj;
};

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

let setUnion = (a, b) => new Set([...a, ...b]);

const orderIdToVanId = vans => {
  //returns { def: 1, zzz: 1, ghi: 2, mno: 2, rst: 2, abc: 3 } for exampleOrders
  const myObj = {};
  for (let i = 0; i < vans.length; i++) {
    vans[i].orders.forEach(oId => (myObj[oId] = i + 1));
  }
  return myObj;
};

function testKnapsack(orders, weight) {
  const result = packAndReport(orders, weight);
  groupByOrderId = byOrderId(orders);
  const allPassing = result.vans.every(item =>
    testWeight(weight, item.orders, groupByOrderId)
  );
  if (!allPassing) {
    throw new Error('not all the orders abide by the weight constraints');
  }

  const orderIdToVanIdObj = orderIdToVanId(result.vans);

  const groupByCutomerId = groupBy(orders, x => x.customerId);
  const vans = Object.values(groupByCutomerId).map(
    os => new Set(os.map(o => orderIdToVanIdObj[o.orderId]))
  );
  const spreadVans = vans.filter(s => s.size > 1).reduce(setUnion, new Set());
  if (result.spreadVanIds.sort() == Array.from(spreadVans).sort()) {
    throw new Error('the spread reported is incorrect');
  }
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

const exampleOrders2 = [
  {
    customerId: 1,
    orderId: 'abc',
    weight: 2
  },
  {
    customerId: 1,
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
    customerId: 1,
    orderId: 'mno',
    weight: 2
  },
  {
    customerId: 1,
    orderId: 'rst',
    weight: 2
  }
];

const exampleOrders3 = [
  {
    customerId: 1,
    orderId: 'abc',
    weight: 1
  },
  {
    customerId: 1,
    orderId: 'ghi',
    weight: 1
  },
  {
    customerId: 1,
    orderId: 'def',
    weight: 1
  },
  {
    customerId: 1,
    orderId: 'zzz',
    weight: 1
  },
  {
    customerId: 1,
    orderId: 'mno',
    weight: 1
  },
  {
    customerId: 1,
    orderId: 'rst',
    weight: 1
  }
];


testKnapsack([], 5);
testKnapsack(exampleOrders, 5);
testKnapsack(exampleOrders2, 4);
testKnapsack(exampleOrders3, 1);

