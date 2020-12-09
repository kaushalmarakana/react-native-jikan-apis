import * as React from "react";
import { View, Text } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavNames } from "./NavNames";
import HomePage from "../pages/HomePage";

const Stack = createStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name={NavNames.pages.home} component={HomePage} />
    </Stack.Navigator>
  );
}

export default MainStack;
