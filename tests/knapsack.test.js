import test from 'ava';

const packAndReport = require('../knapsack');

// method to test if sum of all orders in van is constrainted by the weight
const testWeight = (weight, orders, byOId) =>
  orders.map(id => byOId[id]['weight']).reduce((t, a) => t + a, 0) <= weight;

// to map all orders by their orderIds
const byOrderId = orders => {
  const orderObj = {};
  orders.forEach(o => (orderObj[o.orderId] = o));
  return orderObj;
};

// to group the array values based on key given by the function
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

// union of two sets
let setUnion = (a, b) => new Set([...a, ...b]);

// returns an object which has mappings from orderIdToVanId
const orderIdToVanId = vans => {
  //returns { def: 1, zzz: 1, ghi: 2, mno: 2, rst: 2, abc: 3 } for exampleOrders
  const myObj = {};
  for (let i = 0; i < vans.length; i++) {
    vans[i].orders.forEach(oId => (myObj[oId] = i + 1));
  }
  return myObj;
};

// function to test knapsack
function testKnapsack(orders, weight) {
  // getting the result and grouping it
  const result = packAndReport(orders, weight);
  const groupByOrderId = byOrderId(orders);

  // ensuring all the orders in van abide by the weight constraints
  const allPassing = result.vans.every(item =>
    testWeight(weight, item.orders, groupByOrderId)
  );
  if (!allPassing) {
    throw new Error('not all the orders abide by the weight constraints');
  }

  // get object which maps from orderIdToVanId
  const orderIdToVanIdObj = orderIdToVanId(result.vans);

  // grouping orders by customerId
  const groupByCutomerId = groupBy(orders, x => x.customerId);

  // this line will map all customers' orders to their van Ids
  const vans = Object.values(groupByCutomerId).map(
    os => new Set(os.map(o => orderIdToVanIdObj[o.orderId]))
  );

  // we filter the customer's orders that were not spread
  const spreadVans = vans.filter(s => s.size > 1).reduce(setUnion, new Set());

  // compare the two spreadIds
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

const exampleOrders4 = [
  {
    customerId: 1,
    orderId: 'abc',
    weight: 2
  },
  {
    customerId: 2,
    orderId: 'ghi',
    weight: 2
  },
  {
    customerId: 3,
    orderId: 'def',
    weight: 2
  },
  {
    customerId: 4,
    orderId: 'zzz',
    weight: 2
  },
  {
    customerId: 5,
    orderId: 'mno',
    weight: 2
  },
  {
    customerId: 6,
    orderId: 'rst',
    weight: 2
  }
];

test('exampleOrders', t => {
  t.pass(testKnapsack(exampleOrders, 5));
});
test('single customer', t => {
  t.pass(testKnapsack(exampleOrders2, 4));
});
test('corner case all ones', t => {
  t.pass(testKnapsack(exampleOrders3, 1));
});
test('corner case empty list', t => {
  t.pass(testKnapsack([], 5));
});
test('all different customers', t => {
  t.pass(testKnapsack(exampleOrders4, 3));
});

