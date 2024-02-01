import React from "react";
import { Provider } from "react-redux";
import { defineFeature, loadFeature } from "jest-cucumber";
import configureMockStore from "redux-mock-store";

import App from "./app";

const feature = loadFeature("./app.feature");

const mockStore = configureMockStore();
const store = mockStore({});

defineFeature(feature, (test) => {
  test("render app", ({ then }) => {
    then("render without crashing", () => {
      expect(
        <Provider store={store}>
          <App />
        </Provider>
      );
    });
  });
});
