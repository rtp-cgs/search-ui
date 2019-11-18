export const AUTOCOMPLETE_FETCH = 'AUTOCOMPLETE_FETCH';
export const AUTOCOMPLETE_SUGGESTIONS_RESULTS = 'AUTOCOMPLETE_SUGGESTIONS_RESULTS';
export const AUTOCOMPLETE_SUGGESTIONS_CLEAR = 'AUTOCOMPLETE_SUGGESTIONS_CLEAR';
export const AUTOCOMPLETE_SEARCH_RESULTS = 'AUTOCOMPLETE_SEARCH_RESULTS';
export const AUTOCOMPLETE_SEARCH_CLEAR = 'AUTOCOMPLETE_SEARCH_CLEAR';
export const AUTOCOMPLETE_HIDE = 'AUTOCOMPLETE_HIDE';

export function autocompleteSuggestions(client, keyword) {
  if (!keyword || keyword === '') {
    return {
      type: AUTOCOMPLETE_SUGGESTIONS_CLEAR
    }
  }
  return dispatch => {
    dispatch(autocompleteFetchStart());
    client.suggestions(keyword, (res) => dispatch(autocompleteSuggestionsResults(res)));
  }
}

export function autocompleteSuggestionsResults(results) {
  return {
    type: AUTOCOMPLETE_SUGGESTIONS_RESULTS,
    results
  }
}

export function autocompleteSearch(client, jsonKey, keyword) {
  if (!keyword || keyword === '') {
    return {
      type: AUTOCOMPLETE_SEARCH_CLEAR
    }
  }
  return dispatch => {
    dispatch(autocompleteFetchStart());
    client.search(keyword, (res) => dispatch(autocompleteSearchResults(res, jsonKey)));
  }
}

export function autocompleteSearchResults(results, jsonKey) {
  return {
    type: AUTOCOMPLETE_SEARCH_RESULTS,
    results,
    jsonKey
  }
}

export function autocompleteFetchStart() {
  return {
    type: AUTOCOMPLETE_FETCH
  }
}

export function autocompleteHide() {
  return {
    type: AUTOCOMPLETE_HIDE
  }
}