import React, { ReactNode } from "react";
import { loadFeature, defineFeature } from "jest-cucumber";
import { mount, ReactWrapper } from "enzyme";
import { Collapse } from "@material-ui/core";

import { TemplateCategory } from "types";
import { TemplateMenu, TemplateType } from "editor-constants";
import CategoryContext, { Context } from "../CategoryContext";
import BlmCategoryListItem, { CompProps } from "./BlmCategoryListItem";

const feature = loadFeature("./category-list-item.feature");

const initContext: Context = {
  selectedCategory: undefined,
  onCategoryItemClick: jest.fn(),
};

const category1: TemplateCategory = {
  id: "1",
  name: "Top",
  title: "Top",
  info: "",
  description: "Top",
  type: TemplateType.Category,
  menu: TemplateMenu.Left,
  order: "1",
  children: [],
  helpurl: "",
};

const category2: TemplateCategory = {
  id: "2",
  name: "Header",
  title: "Header",
  description: "Header",
  info: "",
  type: TemplateType.Category,
  menu: TemplateMenu.Left,
  order: "1",
  helpurl: "",
  children: [
    {
      id: "21",
      name: "Objective",
      title: "Objective",
      description: "Objective",
      info: "",
      type: TemplateType.Category,
      order: "1",
      menu: TemplateMenu.Left,
      helpurl: "",
      children: [],
    },
  ],
};

function CustomProvider(props: { context: Context; children: ReactNode }) {
  const { context, children } = props;

  return (
    <CategoryContext.Provider value={{ ...initContext, ...context }}>
      {children}
    </CategoryContext.Provider>
  );
}

function setup() {
  const props: CompProps = {
    data: category1,
  };
  const wrapper = mount(<BlmCategoryListItem {...props} />, { wrappingComponent: CustomProvider });
  const provider = wrapper.getWrappingComponent();

  return { props, wrapper, provider };
}

defineFeature(feature, (test) => {
  const { wrapper, provider } = setup();

  test("Category list item is displayed for category without sub category list", ({
    given,
    when,
    then,
  }) => {
    given("Category list item", () => {});
    when("Data is changed", () => {});
    then("Item is displayed wtihout sub category list", () => {
      testCategoryName(wrapper, category1.name);
      testSubCategoryList(wrapper, false);
    });
  });

  test("Category list item is displayed for category with sub category list", ({
    given,
    when,
    then,
    and,
  }) => {
    given("Category list item", () => {});
    when("Data is changed", () => {
      wrapper.setProps({ data: category2 });
    });
    then("Item is displayed with sub category list", () => {
      testCategoryName(wrapper, category2.name);
      testSubCategoryList(wrapper, true);
    });
    and("Toggle sub category list", () => {
      testToggleSubList(wrapper, false);
      simulateItemClick(wrapper);
      testToggleSubList(wrapper, true);
    });
  });

  test("Category list item is selected", ({ given, when, then }) => {
    given("Category list item", () => {});
    when("Context selectedCategory is changed", () => {
      wrapper.setProps({ data: category1 });
      provider.setProps({ context: { selectedCategory: category1 } });
    });
    then("Item is selected", () => {
      testIsSelected(wrapper, true);
    });
  });

  test("Category list item click is worked", ({ given, when, then }) => {
    given("Category list item", () => {});
    when("Item is clicked", () => {
      simulateItemClick(wrapper);
    });
    then("Item click handler is called", () => {
      expect(initContext.onCategoryItemClick).toHaveBeenCalled();
    });
  });
});

function testCategoryName(wrapper: ReactWrapper, name: string) {
  const lbl = wrapper.find(".category-list-item-box");

  expect(lbl.text()).toEqual(name);
}

function testSubCategoryList(wrapper: ReactWrapper, isVisible: boolean) {
  const collapse = wrapper.find(Collapse);

  if (isVisible) {
    expect(collapse).toHaveLength(1);
  } else {
    expect(collapse).toHaveLength(0);
  }
}

function testToggleSubList(wrapper: ReactWrapper, isOpen: boolean) {
  const collapse = wrapper.find(Collapse);
  const switchBtn = wrapper.find(".category-list-item-switch");

  expect(collapse.props().in).toEqual(isOpen);

  if (isOpen) {
    expect(switchBtn.hasClass("open")).toEqual(true);
  } else {
    expect(switchBtn.hasClass("close")).toEqual(true);
  }
}

function testIsSelected(wrapper: ReactWrapper, isSelected: boolean) {
  const item = wrapper.find(".category-list-item");

  expect(item.hasClass("selected")).toEqual(isSelected);
}

function simulateItemClick(wrapper: ReactWrapper) {
  const itemBox = wrapper.find(".category-list-item-box");

  itemBox.simulate("click");
}
