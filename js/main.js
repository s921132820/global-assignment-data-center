// (function () {
//   'use strict';

//   const app = document.getElementById('app');
//   if (!app) return;

//   app.innerHTML = '<p class="loading">로딩 중...</p>';

//   CountryApi.loadCountries()
//     .then(function (countries) {
//       CountryUI.renderList(app, countries);
//     })
//     .catch(function (err) {
//       app.innerHTML = '<p class="error">국가 정보를 불러오는데 실패했습니다. ' + err.message + '</p>';
//     });
// })();
