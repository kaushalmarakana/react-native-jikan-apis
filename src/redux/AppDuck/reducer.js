const { handleActions } = require("redux-actions");
const {
  ADD_SEARCHED_DATA_TO_LOCAL_STORE,
  CLEAR_SEARCHED_DATA,
} = require("./actionNames");

const initialState = {
  jikan_data_set: {},
};

export default handleActions(
  {
    [ADD_SEARCHED_DATA_TO_LOCAL_STORE](state, { payload }) {
      return {
        ...state,
        jikan_data_set: payload,
      };
    },
    [CLEAR_SEARCHED_DATA](state, { payload }) {
      return {
        ...state,
        jikan_data_set: null,
      };
    },
  },
  initialState,
);
