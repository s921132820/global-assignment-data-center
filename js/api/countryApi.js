(function (window) {
  'use strict';

  var API_BASE = 'https://apis.data.go.kr/1262000/CountryBasicService';
  var SERVICE_KEY = 'c538d63a42c23fe6fba4cacfceaa9f1aa638df34685f9a48c5fa5c30c730a08a';
  var CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  function buildUrl(endpoint, params) {
    var query = ['serviceKey=' + encodeURIComponent(SERVICE_KEY), 'pageNo=1', 'numOfRows=100'];
    for (var key in params) {
      if (params[key]) query.push(key + '=' + encodeURIComponent(params[key]));
    }
    return API_BASE + endpoint + '?' + query.join('&');
  }

  function fetchApi(url) {
    return fetch(CORS_PROXY + encodeURIComponent(url)).then(function (r) { return r.text(); });
  }

  function getTag(text, tagName) {
    var re = new RegExp('<' + tagName + '[^>]*>([\\s\\S]*?)<\\/' + tagName + '>', 'i');
    var m = text.match(re);
    return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
  }

  function parseItemXml(itemXml) {
    var obj = {};
    var tagRe = /<([a-zA-Z_][a-zA-Z0-9_]*)>([\s\S]*?)<\/\1>/g;
    var tm;
    while ((tm = tagRe.exec(itemXml)) !== null) {
      obj[tm[1]] = tm[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
    }
    return Object.keys(obj).length > 0 ? obj : null;
  }

  function parseXmlByRegex(text) {
    var resultCode = getTag(text, 'resultCode') || getTag(text, 'returnReasonCode');
    var resultMsg = getTag(text, 'resultMsg');
    if (resultCode && resultCode !== '00') throw new Error(resultMsg || 'API 오류');

    var itemsMatch = text.match(/<items>([\s\S]*?)<\/items>/i);
    if (!itemsMatch) return null;

    var itemMatch = itemsMatch[1].match(/<item>([\s\S]*?)<\/item>/i);
    if (!itemMatch) return null;

    return parseItemXml(itemMatch[1]);
  }

  function parseXmlListByRegex(text) {
    var resultCode = getTag(text, 'resultCode') || getTag(text, 'returnReasonCode');
    var resultMsg = getTag(text, 'resultMsg');
    if (resultCode && resultCode !== '00') throw new Error(resultMsg || 'API 오류');

    var itemsMatch = text.match(/<items>([\s\S]*?)<\/items>/i);
    if (!itemsMatch) return [];

    var itemsXml = itemsMatch[1];
    var itemRe = /<item>([\s\S]*?)<\/item>/gi;
    var list = [];
    var m;
    while ((m = itemRe.exec(itemsXml)) !== null) {
      var obj = parseItemXml(m[1]);
      if (obj) list.push(obj);
    }
    return list;
  }

  function parseXmlResponse(text) {
    if (!text || (text.trim().indexOf('<') !== 0)) throw new Error('응답 형식 오류');
    var trimmed = text.trim();
    if (trimmed.toLowerCase().indexOf('<html') >= 0 || trimmed.toLowerCase().indexOf('<!doctype') >= 0) {
      throw new Error('API가 HTML을 반환했습니다.');
    }

    var result = null;
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(trimmed.replace(/^\uFEFF/, ''), 'text/xml');
      var err = doc.querySelector('parsererror');
      if (!err) {
        var header = doc.getElementsByTagName('header')[0];
        var body = doc.getElementsByTagName('body')[0];
        var code = header ? (header.getElementsByTagName('resultCode')[0] || {}).textContent || '' : '';
        var msg = header ? (header.getElementsByTagName('resultMsg')[0] || {}).textContent || '' : '';
        if (code && code.trim() !== '00') throw new Error(msg || 'API 오류');

        var itemsEl = body ? body.getElementsByTagName('items')[0] : null;
        var itemEl = itemsEl ? itemsEl.getElementsByTagName('item')[0] : null;
        if (itemEl) {
          result = {};
          for (var i = 0; i < itemEl.childNodes.length; i++) {
            var node = itemEl.childNodes[i];
            if (node.nodeType === 1) result[node.nodeName] = (node.textContent || '').trim();
          }
        }
      }
    } catch (e) {}

    if (!result) result = parseXmlByRegex(trimmed);
    if (!result) throw new Error('국가 정보를 찾을 수 없습니다.');
    return result;
  }

  function parseXmlListResponse(text) {
    if (!text || (text.trim().indexOf('<') !== 0)) throw new Error('응답 형식 오류');
    var trimmed = text.trim();
    if (trimmed.toLowerCase().indexOf('<html') >= 0 || trimmed.toLowerCase().indexOf('<!doctype') >= 0) {
      throw new Error('API가 HTML을 반환했습니다.');
    }

    var list = [];
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(trimmed.replace(/^\uFEFF/, ''), 'text/xml');
      var err = doc.querySelector('parsererror');
      if (!err) {
        var body = doc.getElementsByTagName('body')[0];
        var itemsEl = body ? body.getElementsByTagName('items')[0] : null;
        var itemEls = itemsEl ? itemsEl.getElementsByTagName('item') : [];
        for (var i = 0; i < itemEls.length; i++) {
          var item = itemEls[i];
          var obj = {};
          for (var j = 0; j < item.childNodes.length; j++) {
            var node = item.childNodes[j];
            if (node.nodeType === 1) obj[node.nodeName] = (node.textContent || '').trim();
          }
          if (Object.keys(obj).length > 0) list.push(obj);
        }
      }
    } catch (e) {}

    if (list.length === 0) list = parseXmlListByRegex(trimmed);
    return list;
  }

  window.CountryApi = {
    loadCountries: function () {
      var url = buildUrl('/getCountryBasicList', { numOfRows: '300' });
      return fetchApi(url).then(parseXmlListResponse);
    },

    loadCountryInfo: function (countryName) {
      var url = buildUrl('/getCountryBasicList', { countryName: countryName, numOfRows: '1' });
      return fetchApi(url).then(parseXmlResponse);
    }
  };
})(window);
