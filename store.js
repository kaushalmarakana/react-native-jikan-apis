import AsyncStorage from "@react-native-community/async-storage";
import logger from "redux-logger";
import { createStore, applyMiddleware } from "redux";
import { createAction } from "redux-actions";
import { persistStore, persistReducer } from "redux-persist";

import reducers from "./src/redux/reducers";

const config = {
  key: "root",
  timeout: 0,
  storage: AsyncStorage,
};

const middleWares = [];
middleWares.push(logger);

const persistedReducer = persistReducer(config, reducers);

export const store = createStore(
  persistedReducer,
  applyMiddleware(...middleWares),
);

export const persistor = persistStore(store);

const purgeAction = createAction("PURGE");

export const purgeStore = async () => {
  store.dispatch(purgeAction());
  await persistor.purge();
};
