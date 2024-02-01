import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import { shallow } from "enzyme";
import configureStore from "redux-mock-store";

const shallowWithMockedStore = (component: ReactElement) => {
  const mockState = {};
  const mockStore = configureStore();
  const mockedStore = mockStore(mockState);

  const wrapper = shallow(<Provider store={mockedStore}>{component}</Provider>);

  return { wrapper, store: mockedStore };
};

export default shallowWithMockedStore;
