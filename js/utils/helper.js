(function (window) {
  'use strict';

  window.Utils = window.Utils || {};
  window.Utils.helper = {
    getParam: function (name) {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    }
  };
})(window);
