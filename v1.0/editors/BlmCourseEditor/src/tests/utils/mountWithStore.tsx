import React, { ReactNode, ReactElement } from "react";
import { Store } from "redux";
import { mount, MountRendererProps } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import orgStore from "redux/store";
import { RootState } from "redux/types";
import { deepCopy } from "utils";
import { rootState } from "../mocks";

function StoreProvider(props: { store: Store; children: ReactNode }) {
  const { store, children } = props;

  return <Provider store={store}>{children}</Provider>;
}

export function mountWithStore<P = any>(
  component: ReactElement,
  options?: Omit<MountRendererProps, "wrappingComponent" | "wrappingComponentProps">
) {
  const wrapper = mount<P>(component, {
    ...options,
    wrappingComponent: StoreProvider,
    wrappingComponentProps: { store: orgStore },
  });

  return { wrapper, store: orgStore, provider: wrapper.getWrappingComponent() };
}

export function mountWithMockedStore<P = any>(
  component: ReactElement,
  initState?: RootState,
  options?: Omit<MountRendererProps, "wrappingComponent" | "wrappingComponentProps">
) {
  const mockState = initState || deepCopy(rootState);
  const mockStore = configureMockStore();
  const mockedStore = mockStore(mockState);

  const wrapper = mount<P>(component, {
    ...options,
    wrappingComponent: StoreProvider,
    wrappingComponentProps: { store: mockedStore },
  });

  return {
    wrapper,
    store: mockedStore,
    provider: wrapper.getWrappingComponent(),
  };
}

export default mountWithStore;
