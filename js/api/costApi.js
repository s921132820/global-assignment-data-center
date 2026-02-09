(function (window) {
  'use strict';

  window.CostApi = {
    loadCostInfo: function () {
      return fetch('data/cost_of_living.json').then(function (res) {
        if (!res.ok) return [];
        return res.json();
      });
    }
  };
})(window);
