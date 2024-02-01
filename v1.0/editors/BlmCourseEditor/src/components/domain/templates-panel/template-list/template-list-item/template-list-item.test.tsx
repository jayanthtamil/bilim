import React, { ReactNode } from "react";
import { loadFeature, defineFeature } from "jest-cucumber";
import { mount, ReactWrapper } from "enzyme";

import TemplateListContext, { Context } from "../TemplateListContext";
import { template1, template2 } from "../mock-templates";
import BlmTemplateListItem, { CompProps } from "./BlmTemplateListItem";

const feature = loadFeature("./template-list-item.feature");

const initContext: Context = {
  selectedTemplate: undefined,
  onInfoClick: jest.fn(),
  onAddClick: jest.fn(),
  onVariantsClick: jest.fn(),
};

function CustomProvider(props: { context: Context; children: ReactNode }) {
  const { context, children } = props;

  return (
    <TemplateListContext.Provider value={{ ...initContext, ...context }}>
      {children}
    </TemplateListContext.Provider>
  );
}

function setup() {
  const props: CompProps = {
    data: template1,
  };
  const wrapper = mount(<BlmTemplateListItem {...props} />, { wrappingComponent: CustomProvider });
  const provider = wrapper.getWrappingComponent();
  return {
    props,
    wrapper,
    provider,
  };
}

defineFeature(feature, (test) => {
  const { wrapper, provider } = setup();

  test("Template list item is displayed", ({ given, when, then }) => {
    given("Template list item", () => {});
    when("data is changed", () => {});
    then("Order and Image is displayed", () => {
      testOrder(wrapper, template1.order);
      testImage(wrapper, {
        name: template1.name,
        src: template1.thumbnailLight,
      });
    });
    then("Info, Warning buttons aren't displayed", () => {
      testInfoBtn(wrapper, false);
      testWarningBtn(wrapper, false);
    });
  });

  test("Template list item is displayed with Info and Warning button", ({ given, when, then }) => {
    given("Template list item", () => {});
    when("data is changed", () => {
      wrapper.setProps({
        data: template2,
      });
    });
    then("Order and Image is displayed", () => {
      testOrder(wrapper, template2.order);
      testImage(wrapper, {
        name: template2.name,
        src: template2.thumbnailLight,
      });
    });
    then("Info, Warning buttons are displayed", () => {
      testInfoBtn(wrapper, true);
      testWarningBtn(wrapper, true);
    });
  });

  test("Template list buttons are worked", ({ given, when, then }) => {
    given("Template list item", () => {});
    when("info, warning, add and variant buttons are clicked", () => {
      wrapper.find(".info-icon").simulate("click");
      wrapper.find(".warning-icon").simulate("click");
      wrapper.find(".template-item-add-btn").simulate("click");
      wrapper.find(".template-item-variant-btn").simulate("click");
    });
    then("Buttons handlers are called", () => {
      expect(initContext.onAddClick).toHaveBeenCalled();
      expect(initContext.onVariantsClick).toHaveBeenCalled();
      expect(initContext.onInfoClick).toHaveBeenCalledTimes(2);
    });
  });

  test("Template list item is selected", ({ given, and, when, then }) => {
    given("Template list item", () => {});
    and("Template item is not selected", () => {
      testIsSelected(wrapper, false);
    });
    when("Template context selectedItem is changed", () => {
      const template = wrapper.props().data;

      provider.setProps({ context: { selectedTemplate: template } });
    });
    then("Template item is selected", () => {
      testIsSelected(wrapper, true);
    });
  });
});

function testOrder(wrapper: ReactWrapper, order: string) {
  const label = wrapper.find(".template-item-ind");

  expect(label.text()).toEqual(order);
}

function testImage(wrapper: ReactWrapper, { name, src }: { name: string; src: string }) {
  const img = wrapper.find(".template-item-img");

  expect(img.prop("src")).toEqual(src);
  expect(img.prop("alt")).toEqual(name);
}

function testInfoBtn(wrapper: ReactWrapper, isVisible: boolean) {
  testButton(wrapper, isVisible, ".info-icon");
}

function testWarningBtn(wrapper: ReactWrapper, isVisible: boolean) {
  testButton(wrapper, isVisible, ".warning-icon");
}

function testButton(wrapper: ReactWrapper, isVisible: boolean, selector: string) {
  const btn = wrapper.find(selector);

  if (isVisible) {
    expect(btn).toHaveLength(1);
  } else {
    expect(btn).toHaveLength(0);
  }
}

function testIsSelected(wrapper: ReactWrapper, isSelected: boolean) {
  const selectionBox = wrapper.find(".template-item-box");

  expect(selectionBox.hasClass("selected")).toEqual(isSelected);
}
