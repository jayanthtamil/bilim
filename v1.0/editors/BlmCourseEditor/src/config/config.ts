const { REACT_APP_PATH } = process.env;

export const DOMAIN = window.location.origin.toString();
export const BASE_URL = DOMAIN + REACT_APP_PATH;
export const API_DEFAULT_QUERY_STRING = "?_format=json";
