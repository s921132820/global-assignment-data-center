(function (window) {
  'use strict';

  window.Utils = window.Utils || {};
  window.Utils.format = {
    number: function (num) {
      return num != null ? String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '-';
    }
  };
})(window);
