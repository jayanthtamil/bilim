import React, { ReactNode } from "react";
import { loadFeature, defineFeature } from "jest-cucumber";
import { mount, ReactWrapper } from "enzyme";

import { Template, TemplateCategory } from "types";
import TemplatesPanelContext, { Context } from "../TemplatesPanelContext";
import BlmVariantList from "../variant-list";
import BlmTemplateList from "./BlmTemplateList";
import BlmTemplateListItem, { CompProps as ItemProps } from "./template-list-item";
import {
  simpleCategory1,
  simpleCategory2,
  tabCategory,
  groupCategroy,
  tabGroupCategory,
} from "./mock-templates";

const feature = loadFeature("./template-list.feature");

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
  const props = {
    data: simpleCategory1,
    show: true,
    onCloseClick: jest.fn(),
  };
  const wrapper = mount(<BlmTemplateList {...props} />, {
    wrappingComponent: CustomProvider,
  });

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Template list is displayed with info icon", ({ given, when, then }) => {
    given("Template list component", () => {});
    when("Category is changed", () => {});
    then("Category name is displayed", () => {
      const title = wrapper.find(".category-title");

      expect(title.text()).toEqual(simpleCategory1.name);
    });
    then("Info icon is displayed", () => {
      expect(simpleCategory1.info).not.toEqual("");
      expect(wrapper.find(".category-info")).toHaveLength(1);
    });
    then("Warning message is displayed", () => {
      testWarningBox(wrapper, true);
    });
    then("Template list items are displayed", () => {
      testTemplates(wrapper, simpleCategory1.children as Template[]);
    });
  });

  test("Template list is displyaed without info icon", ({ given, when, then }) => {
    given("Template list component", () => {});
    when("Category is changed", () => {
      wrapper.setProps({ data: simpleCategory2 });
    });
    then("Category name is displayed", () => {
      const title = wrapper.find(".category-title");

      expect(title.text()).toEqual(simpleCategory2.name);
    });
    then("Info icon is not displayed", () => {
      expect(simpleCategory2.info).toEqual("");
      expect(wrapper.find(".category-info")).toHaveLength(0);
    });
    then("Warning message is displayed", () => {
      testWarningBox(wrapper, true);
    });
    then("Template list items are displayed", () => {
      testTemplates(wrapper, simpleCategory2.children as Template[]);
    });
  });

  test("Template list is displayed with Tab Category only", ({ given, when, then }) => {
    let tabCategoryTemplates = (tabCategory.children[0] as TemplateCategory).children as Template[];
    given("Template list component", () => {});
    when("Category is changed", () => {
      wrapper.setProps({ data: tabCategory });
    });
    then("Warning message is not displayed", () => {
      testWarningBox(wrapper, false);
    });
    then("Tabs are displayed", () => {
      testTabs(wrapper, tabCategory.children as TemplateCategory[]);
    });
    then("Template list items are displayed", () => {
      testTemplates(wrapper, tabCategoryTemplates);
    });
  });

  test("Template list is displayed with Group Category only", ({ given, when, then }) => {
    let groupChildren = groupCategroy.children as TemplateCategory[];
    given("Template list component", () => {});
    when("Category is changed", () => {
      wrapper.setProps({ data: groupCategroy });
    });
    then("Warning message is displayed", () => {
      testWarningBox(wrapper, true);
    });
    then("Groups are displayed", () => {
      testGroups(wrapper, groupChildren);
    });
    then("Template list items are displayed", () => {
      testGroupTemplates(wrapper, groupChildren);
    });
  });

  test("Template list is displayed with Tab and Group Category", ({ given, when, then }) => {
    let tabGroupCategories = (tabGroupCategory.children[0] as TemplateCategory)
      .children as TemplateCategory[];
    given("Template list component", () => {});
    when("Category is changed", () => {
      wrapper.setProps({ data: tabGroupCategory });
    });
    then("Warning message is not displayed", () => {
      testWarningBox(wrapper, false);
    });
    then("Tabs are displayed", () => {
      testTabs(wrapper, tabGroupCategory.children as TemplateCategory[]);
    });
    then("Groups are displayed", () => {
      testGroups(wrapper, tabGroupCategories);
    });
    then("Template list items are displayed", () => {
      testGroupTemplates(wrapper, tabGroupCategories);
    });
  });

  test("Show variant list when list item variant button is clicked", ({ given, when, then }) => {
    let item: ReactWrapper<ItemProps, never>;

    given("Template list component", () => {});
    then("Category is changed", () => {
      wrapper.setProps({ data: simpleCategory1 });
    });
    then("Variant list is not displayed", () => {
      const variantList = wrapper.find(BlmVariantList);

      expect(variantList).toHaveLength(0);
    });
    when("Template item variant button is clicked", () => {
      item = wrapper.find(BlmTemplateListItem).first();
      const variantBtn = item.find(".template-item-variant-btn");

      variantBtn.simulate("click");
    });
    then("Variant list is displayed", () => {
      const variantList = wrapper.find(BlmVariantList);

      expect(variantList.props()).toMatchObject({
        data: item.props().data,
        show: true,
      });

      expect(variantList).toHaveLength(1);
    });
  });

  test("Close Template panel when list item add button is clicked", ({ given, when, then }) => {
    let item: ReactWrapper<ItemProps, never>;

    given("Template list component", () => {});
    when("Template item add button is clicked", () => {
      item = wrapper.find(BlmTemplateListItem).first();
      const addBtn = item.find(".template-item-add-btn");

      addBtn.simulate("click");

      expect(templatePanelContext.onAddTemplateClick).toHaveBeenCalled();
    });
    then("Varaint list is closed", () => {
      const variantList = wrapper.find(BlmVariantList);

      expect(variantList.props()).toMatchObject({
        data: item.props().data,
        show: false,
      });
    });
  });

  test("Close Template panel when close button is clicked", ({ given, when, then }) => {
    given("Template list component", () => {});
    when("Close button is clicked", () => {
      const closeBtn = wrapper.find(".template-list-close-btn");

      closeBtn.simulate("click");
    });
    then("Template panel is closed", () => {
      expect(props.onCloseClick).toHaveBeenCalled();
    });
  });

  test("Show popover panel when info btn is clicked", ({ given, when, then }) => {
    given("Template list component", () => {});
    when("Info button is clicked", () => {
      const infoBtn = wrapper.find(".category-info");

      infoBtn.simulate("click");
    });
    then("Popover panel is displayed", () => {
      const popover = wrapper.find(".tempalte-popover-box");

      expect(popover.text()).toBe(simpleCategory1.info);
    });
  });
});

function testWarningBox(wrapper: ReactWrapper, show: boolean) {
  const warningBox = wrapper.find(".category-warning-box");

  if (show) {
    expect(warningBox).toHaveLength(1);
  } else {
    expect(warningBox).toHaveLength(0);
  }
}

function testTemplates(wrapper: ReactWrapper, templates: Template[]) {
  const items = wrapper.find(BlmTemplateListItem);

  expect(items).toHaveLength(templates.length);

  items.forEach((item, i) => {
    const { data } = item.props();

    expect(data).toEqual(templates[i]);
  });
}

function testTabs(wrapper: ReactWrapper, categories: TemplateCategory[]) {
  const tabs = wrapper.find(".MuiTab-root button");

  expect(tabs).toHaveLength(categories.length);

  tabs.forEach((tab, i) => {
    const label = tab.text();
    const { name } = categories[i];

    expect(label).toEqual(name);
  });
}

function testGroups(wrapper: ReactWrapper, categories: TemplateCategory[]) {
  const groups = wrapper.find(".group-category-title");

  expect(groups).toHaveLength(categories.length);

  groups.forEach((group, i) => {
    const label = group.text();
    const { name } = categories[i];

    expect(label).toEqual(name);
  });
}

function testGroupTemplates(wrapper: ReactWrapper, categories: TemplateCategory[]) {
  var templates: Template[] = [];

  categories.forEach((category) => {
    templates = templates.concat(category.children as Template[]);
  });

  testTemplates(wrapper, templates);
}
