(function () {
  'use strict';

  const container = document.getElementById('country-detail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');

  if (!name) {
    container.innerHTML = '<p class="error">국가를 선택해 주세요.</p>';
    return;
  }

  container.innerHTML = '<p class="loading">로딩 중...</p>';

  CountryApi.loadCountryInfo(name)
    .then(function (country) {
      CountryUI.renderDetail(container, country);
    })
    .catch(function (err) {
      container.innerHTML = '<p class="error">' + err.message + '</p>';
    });
})();
