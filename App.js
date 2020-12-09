import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { LogBox, StatusBar } from "react-native";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";

import MainStack from "./src/navigators/MainStack";
import { Colors } from "./src/utils/colors";
import { StyleVars } from "./src/utils/variables";

LogBox.ignoreAllLogs(true);

export default class App extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    StatusBar.setBarStyle("light-content");
    if (StyleVars.IS_ANDROID) {
      StatusBar.setBackgroundColor(Colors.SHADE_1);
    }
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
          <NavigationContainer>
            <MainStack />
          </NavigationContainer>
        </PersistGate>
      </Provider>
    );
  }
}
