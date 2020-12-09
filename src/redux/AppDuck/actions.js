const { createAction } = require("redux-actions");
const {
  ADD_SEARCHED_DATA_TO_LOCAL_STORE,
  CLEAR_SEARCHED_DATA,
} = require("./actionNames");

export const addDataToLocalStore = createAction(
  ADD_SEARCHED_DATA_TO_LOCAL_STORE,
);

export const clearSearchedData = createAction(CLEAR_SEARCHED_DATA);
