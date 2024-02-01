import React, { ReactNode } from "react";
import { loadFeature, defineFeature } from "jest-cucumber";
import { mount, ReactWrapper } from "enzyme";

import { Template } from "types";
import { Switch } from "shared/material-ui";
import { template1 } from "../template-list/mock-templates";
import TemplatesPanelContext, { Context } from "../TemplatesPanelContext";
import BlmVariantList, { CompProps } from "./BlmVariantList";
import BlmVariantListItem from "./variant-list-item";

const feature = loadFeature("./variant-list.feature");

const templatePanelContext: Context = {
  onAddTemplateClick: jest.fn(),
};

function CustomProvider(props: { context: Context; children: ReactNode }) {
  const { context, children } = props;

  return (
    <TemplatesPanelContext.Provider value={{ ...templatePanelContext, ...context }}>
      {children}
    </TemplatesPanelContext.Provider>
  );
}

function setup() {
  const props: CompProps = {
    show: true,
    data: template1,
    onCloseClick: jest.fn(),
  };
  const wrapper = mount(<BlmVariantList {...props} />, {
    wrappingComponent: CustomProvider,
  });

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Varaint list is displayed", ({ given, when, then, and }) => {
    given("Variant list component", () => {});
    when("Data is changed", () => {});
    then("Template name is displayed", () => {
      testVaraintTitle(wrapper, template1.name);
    });
    and("Background light is selected", () => {
      testIsBgChecked(wrapper, false);
    });
    and("Main and variant list is displayed", () => {
      testList(wrapper, template1, false);
    });
  });

  test("Check background switch button is working", ({ given, and, when, then }) => {
    given("Variant list component", () => {});
    and("Background and Varaint list is light", () => {
      testIsBgChecked(wrapper, false);
      testList(wrapper, template1, false);
    });
    when("Background switched to dark", () => {
      triggerBgSwitch(wrapper, true);
    });
    then("Background and Varaint list is dark", () => {
      testIsBgChecked(wrapper, true);
      testList(wrapper, template1, true);
    });
  });

  test("Check item click handler is called", ({ given, when, then, and }) => {
    given("Variant list component", () => {});
    when("Item is clicked", () => {
      const item = wrapper.find(BlmVariantListItem).at(0);
      item.find(".variant-item-img-box").simulate("click");
    });
    then("Item click handler is called", () => {
      expect(templatePanelContext.onAddTemplateClick).toBeCalled();
    });
    and("Item is selected", () => {
      const item = wrapper.find(BlmVariantListItem).at(0);
      const { selected } = item.props();

      expect(selected).toEqual(true);
    });
  });

  test("Close handler is called after close button is clicked", ({ given, when, and }) => {
    given("Variant list component", () => {});
    when("Close button is clicked", () => {
      const close = wrapper.find(".variant-list-close-btn");
      close.simulate("click");
    });
    and("Close handler is called", () => {
      expect(props.onCloseClick).toHaveBeenCalled();
    });
  });
});

function testVaraintTitle(wrapper: ReactWrapper, name: string) {
  const title = wrapper.find(".variant-title");

  expect(title.text()).toEqual(name);
}

function testIsBgChecked(wrapper: ReactWrapper, isChecked: boolean) {
  const bgSwitch = wrapper.find(Switch);

  expect(bgSwitch.props().checked).toEqual(isChecked);
}

function testList(wrapper: ReactWrapper, template: Template, isBgChecked: boolean) {
  const nodes = wrapper.find(BlmVariantListItem);
  const items = [template, ...template.variants];

  nodes.forEach((node, i) => {
    const { data, bgChecked } = node.props();

    expect(data).toEqual(items[i]);
    expect(bgChecked).toEqual(isBgChecked);
  });
}

function triggerBgSwitch(wrapper: ReactWrapper, checked: boolean) {
  const bgSwitch = wrapper.find(Switch).find("input");

  bgSwitch.simulate("change", { target: { checked } });
}
