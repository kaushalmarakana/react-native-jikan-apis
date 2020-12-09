import Axios from "./Axios";

const BASE_ROUTE = "/search/anime";

/**
 *
 * @param {*} text
 * @param {*} page
 */
const search = (text, page) =>
  Axios.get(`${BASE_ROUTE}?q=${text}&page=${page}`);

export const AnimeApis = {
  search,
};
