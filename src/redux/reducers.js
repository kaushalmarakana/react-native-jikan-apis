const { combineReducers } = require("redux");
import AppDuck from "./AppDuck/reducer";

const appReducer = combineReducers({
  app: AppDuck,
});

export default appReducer;
