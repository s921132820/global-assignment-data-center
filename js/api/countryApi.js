(function (window) {
  'use strict';

  const API_BASE = 'https://apis.data.go.kr/1262000/CountryBasicService';
  const SERVICE_KEY = 'c538d63a42c23fe6fba4cacfceaa9f1aa638df34685f9a48c5fa5c30c730a08a';
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  function buildUrl(endpoint, params) {
    const query = ['serviceKey=' + encodeURIComponent(SERVICE_KEY), 'pageNo=1', 'numOfRows=100'];
    for (const key in params) {
      if (params[key]) query.push(key + '=' + encodeURIComponent(params[key]));
    }
    return API_BASE + endpoint + '?' + query.join('&');
  }

  function fetchApi(url) {
    return fetch(CORS_PROXY + encodeURIComponent(url)).then(function (r) { return r.text(); });
  }

  function getTag(text, tagName) {
    const re = new RegExp('<' + tagName + '[^>]*>([\\s\\S]*?)<\\/' + tagName + '>', 'i');
    const m = text.match(re);
    return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
  }

  function parseItemXml(itemXml) {
    const obj = {};
    const tagRe = /<([a-zA-Z_][a-zA-Z0-9_]*)>([\s\S]*?)<\/\1>/g;
    let tm;
    while ((tm = tagRe.exec(itemXml)) !== null) {
      obj[tm[1]] = tm[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
    }
    return Object.keys(obj).length > 0 ? obj : null;
  }

  function parseXmlByRegex(text) {
    const resultCode = getTag(text, 'resultCode') || getTag(text, 'returnReasonCode');
    const resultMsg = getTag(text, 'resultMsg');
    if (resultCode && resultCode !== '00') throw new Error(resultMsg || 'API 오류');

    const itemsMatch = text.match(/<items>([\s\S]*?)<\/items>/i);
    if (!itemsMatch) return null;

    const itemMatch = itemsMatch[1].match(/<item>([\s\S]*?)<\/item>/i);
    if (!itemMatch) return null;

    return parseItemXml(itemMatch[1]);
  }

  function parseXmlListByRegex(text) {
    const resultCode = getTag(text, 'resultCode') || getTag(text, 'returnReasonCode');
    const resultMsg = getTag(text, 'resultMsg');
    if (resultCode && resultCode !== '00') throw new Error(resultMsg || 'API 오류');

    const itemsMatch = text.match(/<items>([\s\S]*?)<\/items>/i);
    if (!itemsMatch) return [];

    const itemsXml = itemsMatch[1];
    const itemRe = /<item>([\s\S]*?)<\/item>/gi;
    const list = [];
    let m;
    while ((m = itemRe.exec(itemsXml)) !== null) {
      const obj = parseItemXml(m[1]);
      if (obj) list.push(obj);
    }
    return list;
  }

  function parseXmlResponse(text) {
    if (!text || (text.trim().indexOf('<') !== 0)) throw new Error('응답 형식 오류');
    const trimmed = text.trim();
    if (trimmed.toLowerCase().indexOf('<html') >= 0 || trimmed.toLowerCase().indexOf('<!doctype') >= 0) {
      throw new Error('API가 HTML을 반환했습니다.');
    }

    let result = null;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed.replace(/^\uFEFF/, ''), 'text/xml');
      const err = doc.querySelector('parsererror');
      if (!err) {
        const header = doc.getElementsByTagName('header')[0];
        const body = doc.getElementsByTagName('body')[0];
        const code = header ? (header.getElementsByTagName('resultCode')[0] || {}).textContent || '' : '';
        const msg = header ? (header.getElementsByTagName('resultMsg')[0] || {}).textContent || '' : '';
        if (code && code.trim() !== '00') throw new Error(msg || 'API 오류');

        const itemsEl = body ? body.getElementsByTagName('items')[0] : null;
        const itemEl = itemsEl ? itemsEl.getElementsByTagName('item')[0] : null;
        if (itemEl) {
          result = {};
          for (let i = 0; i < itemEl.childNodes.length; i++) {
            const node = itemEl.childNodes[i];
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
    const trimmed = text.trim();
    if (trimmed.toLowerCase().indexOf('<html') >= 0 || trimmed.toLowerCase().indexOf('<!doctype') >= 0) {
      throw new Error('API가 HTML을 반환했습니다.');
    }

    let list = [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed.replace(/^\uFEFF/, ''), 'text/xml');
      const err = doc.querySelector('parsererror');
      if (!err) {
        const body = doc.getElementsByTagName('body')[0];
        const itemsEl = body ? body.getElementsByTagName('items')[0] : null;
        const itemEls = itemsEl ? itemsEl.getElementsByTagName('item') : [];
        for (let i = 0; i < itemEls.length; i++) {
          const item = itemEls[i];
          const obj = {};
          for (let j = 0; j < item.childNodes.length; j++) {
            const node = item.childNodes[j];
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
      const url = buildUrl('/getCountryBasicList', { numOfRows: '300' });
      return fetchApi(url).then(parseXmlListResponse);
    },

    loadCountryInfo: function (countryName) {
      const url = buildUrl('/getCountryBasicList', { countryName: countryName, numOfRows: '1' });
      return fetchApi(url).then(parseXmlResponse);
    }
  };
})(window);
