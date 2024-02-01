import React, { ReactComponentElement } from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { mount, ReactWrapper } from "enzyme";

import { TemplateFilter, TemplateScopeFilter } from "types";
import { TemplateScope, CourseDisplay } from "editor-constants";
import BlmTemplateList from "../template-list";
import categories from "./mock-categories";
import BlmCategoryList, { CompProps } from "./BlmCategoryList";
import BlmCategoryListItem, { CompProps as ItemProps } from "./category-list-item";

const feature = loadFeature("./category-list.feature");

function setup() {
  const filter: TemplateFilter = {
    scope: new TemplateScopeFilter(TemplateScope.Screen),
    display: CourseDisplay.Desktop,
  };

  const props: CompProps = {
    categories: categories,
    filter,
    onClose: jest.fn(),
  };
  const wrapper = mount<ReactComponentElement<typeof BlmCategoryListItem>, CompProps>(
    <BlmCategoryList {...props} />
  );

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();
  let categoryItem: ReactWrapper<ItemProps, never>;

  test("Empty categories should not be shown", ({ given, when, then }) => {
    given("Category list component", () => {});
    when("Categories is given", () => {});
    then("Empty categories are not displayed", () => {
      const list = wrapper.find(".category-list-box > .category-list").at(1).children();

      list.forEach((node, i) => {
        const { data } = node.props();

        expect(data).not.toEqual(categories[0].children[i]);
      });
    });
  });

  test("Categories are displayed as per order", ({ given, when, then }) => {
    given("Category list component", () => {});
    when("Categories is given", () => {});
    then("Categories are displayed as per oder", () => {
      const list = wrapper.find(".category-list-box > .category-list").at(1).children();

      list.forEach((node, i) => {
        const { data } = node.props();

        expect(data.order).toEqual((i + 1).toString());
      });
    });
  });

  test("Template list is displayed after category is selected", ({ given, when, then }) => {
    given("Category list component", () => {});
    when("Category is selected", () => {
      categoryItem = wrapper.find(BlmCategoryListItem).first();

      expect(wrapper.find(BlmTemplateList)).toHaveLength(0);
      categoryItem.find(".category-list-item-box").simulate("click");
    });
    then("Template list is displayed", () => {
      const templateList = wrapper.find(BlmTemplateList);

      expect(templateList.props()).toMatchObject({
        data: categoryItem.props().data,
        show: true,
      });
      expect(templateList).toHaveLength(1);
    });
  });

  test("Category list is closed after close button is clicked", ({ given, when, then }) => {
    given("Category list component", () => {});
    when("Category is selected", () => {
      expect(categoryItem).not.toBeNull();
    });
    then("Template list is displayed", () => {
      const templateList = wrapper.find(BlmTemplateList);

      expect(templateList.props()).toMatchObject({
        data: categoryItem.props().data,
        show: true,
      });
      expect(templateList).toHaveLength(1);
    });
    when("Close button is clicked", () => {
      const btn = wrapper.find(".category-list-close-btn");
      btn.simulate("click");
    });
    then("Category list is closed", () => {
      expect(props.onClose).toHaveBeenCalled();
    });
    then("Template list is closed", () => {
      const templateList = wrapper.find(BlmTemplateList);

      expect(templateList.props()).toMatchObject({
        data: categoryItem.props().data,
        show: false,
      });
      expect(templateList).toHaveLength(1);
    });
  });

  test("All category is created from all category templates", ({ given, when, then }) => {
    given("Category list component", () => {});
    when("Categories is given", () => {});
    then("All category is created with all categroy templates", () => {
      const list = wrapper.find(".category-list-box > .category-list").at(0);
      const all = list.find(BlmCategoryListItem);
      const category = all.props().data;

      expect(category.name).toEqual("all");
      expect(category.order).toEqual("0");
      expect(category.children.length).toEqual(3);
    });
  });
});
