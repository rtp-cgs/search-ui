/* global window, history */
import { WARMUP_QUERY_PREFIX, MATCH_ALL_QUERY } from '../index';
import { search } from '../actions/search';
import { setKeyword } from '../actions/keyword';
import { setPage } from '../actions/pagination';
import { setActiveFilters, setActiveFacets } from '../actions/filters';

export const HISTORY_PARAMETERS = {
  SEARCH: 'search',
  FILTERS: 'search_filters',
  FACETS: 'search_facets',
  PAGE: 'search_page'
}


export function setHistory(parameter, value) {
  // ignore warmup search query
  if (parameter === HISTORY_PARAMETERS.SEARCH &&
      value && value.indexOf(WARMUP_QUERY_PREFIX) === 0) {
    return;
  }

  const url = window.location.href;
  const params = queryParamsToObject(url);

  // If pagination parameter and page=1, don't add to URL
  if (parameter === HISTORY_PARAMETERS.PAGE && value == 1) {
    delete params[parameter];
  }
  else if (parameter === HISTORY_PARAMETERS.SEARCH && value == MATCH_ALL_QUERY) {
    delete params[parameter];
  }
  // Add value to URL
  else if (parameter && value !== null && value !== '') {
    params[parameter] = value;
  }
  // No value. Delete query parameter
  else if (parameter) {
    delete params[parameter];
  }

  let stateUrl = url;
  if (url.indexOf('?') !== -1) {
    stateUrl = url.substring(0, url.indexOf('?'));
  }
  if (JSON.stringify(params) !== JSON.stringify({})) {
    stateUrl = stateUrl + '?' + objectToQueryParams(params);
  }

  // Firt time called
  if (history.state === null) {
    history.replaceState(params, '', stateUrl);
  }
  // Update history if it has changed
  else if (JSON.stringify(history.state) !== JSON.stringify(params)) {
    history.pushState(params, '', stateUrl);
  }
}


export function getQueryParam(url, param) {
  const name = param.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}


export function initFromURL(client, reduxStore, createFilterObjectFunction, searchFunction, hasMatchAllQuery) {
  // Initial load
  const url = window.location.href;
  const qs = queryParamsToObject(url);
  handleURLParams(client, reduxStore, qs, createFilterObjectFunction, searchFunction, false);

  // Browser back button. Re-handle URL
  window.onpopstate = (e) => {
    const qs = queryParamsToObject(window.location.href);
    handleURLParams(client, reduxStore, qs, createFilterObjectFunction, searchFunction, hasMatchAllQuery);
  }
}


function handleURLParams(client, store, qs, createFilterObjectFunction, searchFunction, hasMatchAllQuery) {
  let hasFacetsOrFilters = false;
  if (qs[HISTORY_PARAMETERS.FILTERS]) {
    // Take active filters from URL
    const filtersJson = urlParamToJSON(qs[HISTORY_PARAMETERS.FILTERS]);
    store.dispatch(setActiveFilters(filtersJson));
    hasFacetsOrFilters = true;
  }

  if (qs[HISTORY_PARAMETERS.FACETS]) {
    // Take active facets from URL
    const facetsJson = urlParamToJSON(qs[HISTORY_PARAMETERS.FACETS]);
    store.dispatch(setActiveFacets(facetsJson));
    hasFacetsOrFilters = true;
  }

  // Has facets or filters. Update client state
  if (hasFacetsOrFilters) {
    const filterState = store.getState().filters;
    const filterObject = createFilterObjectFunction(filterState);
    client.setFilterObject(filterObject);
  }
  // No facets or filters
  else {
    store.dispatch(setActiveFilters(null));
    store.dispatch(setActiveFacets(null));
    client.setFilterObject(null);
  }



  if (qs[HISTORY_PARAMETERS.PAGE]) {
    store.dispatch(setPage(client, parseInt(qs[HISTORY_PARAMETERS.PAGE], 10)));
  }
  else {
    store.dispatch(setPage(client, 1));
  }

  if (qs[HISTORY_PARAMETERS.SEARCH]) {
    const keyword = decodeURIComponent(qs[HISTORY_PARAMETERS.SEARCH]);
    store.dispatch(setKeyword(keyword, true));
    searchFunction(keyword);
  }
  else if (hasMatchAllQuery === true) {
    store.dispatch(setKeyword(MATCH_ALL_QUERY, true));
    searchFunction(MATCH_ALL_QUERY);
  }
}



/**
 * Pick up query parameters from an URL and return them as a JSON object
 *
 * Example: ?foo=bar&baz=x returns
 * { foo: 'bar', baz: 'x' }
 */
export function queryParamsToObject(url) {
  if (url.indexOf('?') === -1) {
    return {};
  }

  let qs = url.substring(url.indexOf('?') + 1);
  if (qs === '') {
    return {};
  }
  if (qs.indexOf('#') !== -1) {
    qs = qs.substring(0, qs.indexOf('#'));
  }

  let obj = {};
  const qsArr = qs.split('&');

  qsArr.forEach(v => {
    const kv = v.split('=');
    if (kv[0] && kv[0].length > 0 && kv.length > 1) {
      obj[kv[0]] = decodeURIComponent(kv[1]);
    }
  });

  return obj;
}

/**
 * Example: { foo: 'bar', baz: 'x' } returns
 * foo=bar&baz=x
 */
export function objectToQueryParams(obj) {
  let qs = '';

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (qs !== '') {
        qs = qs + '&';
      }
      const value = obj[key] ? obj[key] : '';
      qs = qs + key + '=' + encodeURIComponent(value);
    }
  }

  return qs;
}

/**
 * Transfer a URL parameter to a JSON object
 */
export function urlParamToJSON(urlParameter) {
  try {
    return JSON.parse(urlParameter);
  }
  catch(error) {}
  return null;
}

/**
 * Transfer JSON object to a string suitable for URL param
 */
export function jsonToUrlParam(json) {
  if (Object.keys(json).length > 0) {
    return JSON.stringify(json);
  }
  return null;
}

/**
 * Redirect to search results page
 */
export function redirectToSearchResultsPage(url, keyword) {
  window.location.href = url + '?' + HISTORY_PARAMETERS.SEARCH + '=' + encodeURIComponent(keyword);
}
