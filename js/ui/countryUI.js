(function (window) {
  'use strict';

  window.CountryUI = {
    renderList: function (container, countries) {
      if (!countries || countries.length === 0) {
        container.innerHTML = '<p class="loading">등록된 국가가 없습니다.</p>';
        return;
      }

      let html = '<div class="country-list">';
      countries.forEach(function (c) {
        const name = c.countryNmae || c.countryName || c.name || '-';
        html += '<div class="country-card">';
        html += '<a href="pages/country.html?name=' + encodeURIComponent(name) + '">';
        if (c.imgUrl) html += '<img src="' + escapeHtml(c.imgUrl) + '" alt="" class="flag" />';
        html += '<span class="name">' + escapeHtml(name) + '</span>';
        html += '<span class="en-name">' + escapeHtml(c.countryEnName || c.nameEn || '') + '</span>';
        html += '<span class="continent">' + escapeHtml(c.continent || '') + '</span>';
        html += '</a></div>';
      });
      html += '</div>';
      container.innerHTML = html;
    },

    renderDetail: function (container, country) {
      if (!country) {
        container.innerHTML = '<p class="error">국가 정보를 찾을 수 없습니다.</p>';
        return;
      }

      const name = country.countryNmae || country.countryName || country.name || '-';
      const nameEn = country.countryEnName || country.nameEn || '-';
      const continent = country.continent || '-';
      const basic = (country.basic || '').replace(/\n/g, '<br>').replace(/ㅇ/g, '•');

      let html = '<div class="country-detail">';
      if (country.imgUrl) html += '<img src="' + escapeHtml(country.imgUrl) + '" alt="" class="country-flag" />';
      html += '<h2>' + escapeHtml(name) + '</h2>';
      html += '<p><strong>영문명:</strong> ' + escapeHtml(nameEn) + '</p>';
      html += '<p><strong>대륙:</strong> ' + escapeHtml(continent) + '</p>';
      html += '<div class="basic-info">' + basic + '</div>';
      html += '</div>';
      container.innerHTML = html;
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})(window);
