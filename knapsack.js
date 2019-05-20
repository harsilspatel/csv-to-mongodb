'use strict';

const WEIGHT = 5;

function groupBy(array, fn) {
  // can use reduce?
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

function knapsack(items, weightFn, valueFn, capacity) {
  // https://gist.github.com/lqt0223/21f033450a9d762ce8aee4da336363b1
  // This implementation uses dynamic programming.
  // Variable 'memo' is a grid(2-dimentional array) to store optimal solution for sub-problems,
  // which will be later used as the code execution goes on.
  // This is called memoization in programming.
  // The cell will store best solution objects for different capacities and selectable items.
  var memo = [];

  if (items.length === 0) {
    return { maxValue: 0, subset: []}
  }

  // Filling the sub-problem solutions grid.
  for (var i = 0; i < items.length; i++) {
    // Variable 'cap' is the capacity for sub-problems. In this example, 'cap' ranges from 1 to 6.
    var row = [];
    for (var cap = 1; cap <= capacity; cap++) {
      row.push(getSolution(i, cap));
    }
    memo.push(row);
  }

  // The right-bottom-corner cell of the grid contains the final solution for the whole problem.
  return getLast();

  function getLast() {
    var lastRow = memo[memo.length - 1];
    return lastRow[lastRow.length - 1];
  }

  function getSolution(row, cap) {
    const NO_SOLUTION = { maxValue: 0, subset: [] };
    // the column number starts from zero.
    var col = cap - 1;
    var lastItem = items[row];
    // The remaining capacity for the sub-problem to solve.
    var remaining = cap - weightFn(lastItem);

    // Refer to the last solution for this capacity,
    // which is in the cell of the previous row with the same column
    var lastSolution =
      row > 0 ? memo[row - 1][col] || NO_SOLUTION : NO_SOLUTION;
    // Refer to the last solution for the remaining capacity,
    // which is in the cell of the previous row with the corresponding column
    var lastSubSolution =
      row > 0 ? memo[row - 1][remaining - 1] || NO_SOLUTION : NO_SOLUTION;

    // If any one of the items weights greater than the 'cap', return the last solution
    if (remaining < 0) {
      return lastSolution;
    }

    // Compare the current best solution for the sub-problem with a specific capacity
    // to a new solution trial with the lastItem(new item) added
    var lastValue = lastSolution.maxValue;
    var lastSubValue = lastSubSolution.maxValue;

    var newValue = lastSubValue + valueFn(lastItem);
    if (newValue >= lastValue) {
      // copy the subset of the last sub-problem solution
      var _lastSubSet = lastSubSolution.subset.slice();
      _lastSubSet.push(lastItem);
      return { maxValue: newValue, subset: _lastSubSet };
    } else {
      return lastSolution;
    }
  }
}

function packAndReport(orders, weight) {
  const spread = {};
  const result = {vans: []}
  const groups = groupBy(orders, x => x.customerId);
  const customerIds = Object.keys(groups);
  // console.log(groups)
  for (const c of customerIds) { // can be done with forEach
    spread[c] = []
    while (true) {
      const customerOrders = groups[c];
      // console.log(customerOrders)
      const knap = knapsack(customerOrders, x => x.weight, () => 1, weight);
      const knapWeight = knap.subset.reduce((sum, a) => sum + a.weight, 0);
      // console.log(knap)
      if (knapWeight === weight) {
        groups[c] = groups[c].filter(item => !(knap.subset.includes(item)));
        result.vans.push({orders: knap.subset.map(item => item.orderId)});
        spread[c].push(result.vans.length);
        // console.log(groups[c]);
      } else {
        // console.log('breaking')
        break;
      }
    }
    // break;
  }
  // console.log(spread)
  // console.log(groups)
  let leftOrders = Object.values(groups).flat();
  // console.log(leftOrders);
  // console.log('done with for')
  while (leftOrders.length) {
    const knap = knapsack(leftOrders, x => x.weight, () => 1, weight);
    // console.log(knap);
    leftOrders = leftOrders.filter(item => !(knap.subset.includes(item)));
    result.vans.push({orders: knap.subset.map(item => item.orderId)});
    const knapCustomerIds = new Set(knap.subset.map(item => item.customerId));
    // console.log(knapCustomerIds);
    knapCustomerIds.forEach(id => spread[id].push(result.vans.length));
  }
  // console.log(spread)
  result.spreadVanIds = Array.from(new Set(Object.values(spread).filter(arr => arr.length > 1).flat()));
  return result;
}

// const group = groupBy(exampleOrders, x => x.customerId);
// const k = knapsack([], x => x.weight, () => 1, WEIGHT);
// const knapValue = k.subset.reduce((sum, a) => sum + a.weight, 0)
// // console.log(group)
// // console.log(k.subset);
// // console.log(group['1'].includes(k.subset[0]));

// // console.log(knapValue)
// console.log(JSON.stringify(packAndReport(exampleOrders)));

module.exports = packAndReport;
