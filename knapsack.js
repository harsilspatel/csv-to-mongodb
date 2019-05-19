'use strict';
// const exampleReturnValue = {
//   vans: [
//     {
//       orders: ['abc', 'ghi'], // customerId 1 and 2
//     },
//     {
//       orders: ['def', 'zzz'], // customerId 1 only
//     },
//     {
//       orders: ['mno', 'rst'], // customerId 2 and 3
//     },
//   ],
//   // 1 and 2 for customerId 1 and
//   // 1 and 3 for customerId 2
//   spreadVanIds: [1, 2, 3],
// };

const exampleOrders = [
  {
    customerId: 1,
    orderId: 'abc',
    weight: 2,
  },
  {
    customerId: 2,
    orderId: 'ghi',
    weight: 1,
  },
  {
    customerId: 1,
    orderId: 'def',
    weight: 4,
  },
  {
    customerId: 1,
    orderId: 'zzz',
    weight: 1,
  },
  {
    customerId: 2,
    orderId: 'mno',
    weight: 2,
  },
  {
    customerId: 3,
    orderId: 'rst',
    weight: 2,
  },
];

const knapsack = require('knapsack-js');

const WEIGHT = 5;

function packAndReport(orders) {

}

function groupBy(array, fn) {
  // can use reduce?
  const group = {};
  array.forEach(element => {
    const key = fn(element);
    if (!(key in group)) {
      group[key]= []
    }
    group[key].push(element)
  });
  return group;
}

console.log(groupBy(exampleOrders, x => x.customerId));
