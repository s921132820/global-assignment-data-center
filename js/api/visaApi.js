(function (window) {
  'use strict';

  window.VisaApi = {
    loadVisaInfo: function () {
      return fetch('data/visa.json').then(function (res) {
        if (!res.ok) return [];
        return res.json();
      });
    }
  };
})(window);
