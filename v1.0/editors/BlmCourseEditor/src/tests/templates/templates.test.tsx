import React, { ComponentProps } from "react";
import { loadFeature, defineFeature } from "jest-cucumber";
import { ReactWrapper } from "enzyme";
import { TreeNode } from "rc-tree";
import { MenuItem } from "@material-ui/core";

import { TemplateCategory, Template } from "types";
import { TemplateMenu, TemplateContext, TemplateScope, StructureType } from "editor-constants";
import { mountWithStore, actUpdateWrapper } from "tests/utils";
import App from "components/app";
import BlmStructurePanel from "components/structures/panel";
import BlmCategoryList, {
  hasSubCategory,
  isCategory,
} from "components/domain/templates-panel/category-list";
import BlmCategoryListItem from "components/domain/templates-panel/category-list/category-list-item";
import { BlmAddPartPageBtn, BlmPageMenu } from "components/templates/controls";

const feature = loadFeature("./templates.feature");

type CategoryListWrapper = ReactWrapper<ComponentProps<typeof BlmCategoryList>>;
type CategoryItemWrapper = ReactWrapper<ComponentProps<typeof BlmCategoryListItem>>;

function setup() {
  //With attaching element iframe is not working
  //https://stackoverflow.com/questions/41447842/test-the-content-of-an-iframe-in-a-react-component-with-enzyme
  const div = document.createElement("div");
  document.body.appendChild(div);
  const { store, wrapper } = mountWithStore(<App />, { attachTo: div });

  return {
    store,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  let wrapper: ReactWrapper, categoryPanel: CategoryListWrapper, categories: TemplateCategory[];

  beforeAll(async () => {
    wrapper = setup().wrapper;

    await actUpdateWrapper(wrapper);
  });

  test("As a user, I want to assign a template to a screen", ({ given, and, when, then }) => {
    given("Screen is created under the course structure and display in the treeview", () => {});
    and("The screen does not have a template yet", () => {});
    when("I click edit screen", () => {});
    then("The list of template categories is displayed at the left panel", () => {});
    and("All template under the categories should have scope=screen", () => {});
    and("None of these templates should have other scope than screen", () => {});
    and("Template categories cannot be empty", () => {});
    and("The categories at the left panel should have the field menu=left", () => {});
  });

  test("As a user, I want to create a partpage", ({ given, when, and, then }) => {
    given("A page is created under the course structure and display in the editor", () => {
      const strcuturePanel = wrapper.find(BlmStructurePanel);
      const treeItem = getTreeItem(strcuturePanel, StructureType.Structure, "2632");

      expect(treeItem).toHaveLength(1);
      simulateTreeItemClick(treeItem);

      return actUpdateWrapper(wrapper);
    });
    when("I click add partpage in the page (button + between 2 partpage)", () => {
      const iframe = wrapper.find("iframe");
      const addPageBtn = iframe
        .find(BlmAddPartPageBtn)
        .find('[className^="BlmAddPartPageBtn-addPartPageIcon-"]');

      expect(addPageBtn).toHaveLength(1);
      addPageBtn.simulate("click");
    });
    and("I select Content in the menu", () => {
      const pageMenu = wrapper.find(BlmPageMenu);
      const contentItem = pageMenu.find(MenuItem).at(0);

      contentItem.simulate("click");

      return actUpdateWrapper(wrapper);
    });
    then("The list of template categories is displayed at the left panel", () => {
      categoryPanel = wrapper.find(BlmCategoryList);

      expect(categoryPanel).toHaveLength(1);
    });
    and("All template under the categories should have scope=partpage", () => {
      categories = getCategories(categoryPanel);
      testTemplatesScope(categories, TemplateScope.PartPage);
    });
    and("None of these templates should have another scope than partpage", () => {});
    and("Template categories cannot be empty", () => {
      testCategoryIsEmpty(categories);
    });
    and("The categories at the left panel should have the field menu=left", () => {
      testCategoryMenuField(wrapper, categoryPanel, TemplateMenu.Left);
    });
    and("Templates context value doesn’t matter", () => {
      testTemplateContext(categories);
    });
  });

  test("As a user, I want to assign a template to a question", ({ given, and, when, then }) => {
    given(
      "The question is created under the course structure and display in the treeview",
      () => {}
    );
    and("The question does not have a template yet", () => {});
    when("I click edit question", () => {});
    then("The list of template categories is displayed at the left panel", () => {});
    and("All template under the categories should have scope=question", () => {});
    and("None of these templates should have other scope than question", () => {});
    and("Template categories cannot be empty", () => {});
    and("The categories at the left panel should have the field menu=left", () => {});
    and("Templates context value doesn’t matter", () => {});
  });

  test("As a user, I want to create a partpage question", ({ given, when, and, then }) => {
    given("A page is created under the course structure and display in the editor", () => {});
    when("I click add partpage in the page (button + between 2 partpage)", () => {});
    and("I select Question in the menu", () => {});
    then("The list of template categories is displayed at the left panel", () => {});
    and("All template under the categories should have scope=question", () => {});
    and("None of these templates should have other scope than question", () => {});
    and("All template under the categories should have context=page", () => {});
    and("None of these templates should have another context than page", () => {});
    and("Template categories cannot be empty", () => {});
    and("The categories at the left panel should have the field menu=left", () => {});
  });

  test("As a user, I want to create a simple content under screen", ({
    given,
    and,
    when,
    then,
  }) => {
    given("The simple content is created under a screen and display in the editor", () => {});
    and("The simple content does not have a template yet", () => {});
    and("The screen parent doesn’t have any interaction", () => {});
    when("I click edit simple content", () => {});
    then("The list of template categories is displayed at the left panel", () => {});
    and("All template under the categories should have scope=simple content", () => {});
    and("None of these templates should have other scope than simple content", () => {});
    and("All template under the categories should have context=screen", () => {});
    and("None of these templates should have another context than screen", () => {});
    and("Template categories cannot be empty", () => {});
    and("The categories at the left panel should have the field menu=left", () => {});
  });

  test("As a user, I want to create a simple content under partpage", ({
    given,
    and,
    when,
    then,
  }) => {
    given("The simple content is created under a partpage and display in the editor", () => {});
    and("The simple content does not have a template yet", () => {});
    and("The partpage parent doesn’t have any interaction", () => {});
    when("I click edit simple content", () => {});
    then("The list of template categories is displayed at the left panel", () => {});
    and("All template under the categories should have scope=simple content", () => {});
    and("None of these templates should have other scope than simple content", () => {});
    and("All template under the categories should have context=partpage", () => {});
    and("None of these templates should have another context than partpage", () => {});
    and("Template categories cannot be empty", () => {});
    and("The categories at the left panel should have the field menu=left", () => {});
  });

  test("As a user, I want to create a simple content under question", ({
    given,
    and,
    when,
    then,
  }) => {
    given("The simple content is created under a question and display in the editor", () => {});
    and("The simple content does not have a template yet", () => {});
    when("I click edit simple content", () => {});
    then("The list of template categories is displayed at the left panel", () => {});
    and("All template under the categories should have scope=simple content", () => {});
    and("None of these templates should have other scope than simple content", () => {});
    and("All template under the categories should have context=question", () => {});
    and("None of these templates should have another context than question", () => {});
    and("Template categories cannot be empty", () => {});
    and("The categories at the left panel should have the field menu=left", () => {});
  });
});

function getTreeItem(structureWrapper: ReactWrapper, structureType: StructureType, id?: string) {
  const tree = structureWrapper.find(".blm-tree-container." + structureType);
  const items = tree.find(TreeNode);
  const result = items.find({ data: { id: id } }).at(0);

  return result;
}

function simulateTreeItemClick(wrapper: ReactWrapper) {
  const treeItem = wrapper.find(".rc-tree-node-content-wrapper");

  treeItem.simulate("click");
}

function getCategories(wrapper: CategoryListWrapper) {
  const categories: TemplateCategory[] = [];
  const items = wrapper.find(BlmCategoryListItem);

  items.forEach((item) => {
    const category = item.props().data;

    categories.push(category);
  });

  return categories;
}

function testCategoryIsEmpty(categories: TemplateCategory[] | Template[]) {
  if (categories) {
    expect(categories.length).toBeGreaterThan(0);
    for (let category of categories) {
      if (isCategory(category)) {
        expect(category.children.length).toBeGreaterThan(0);
        testCategoryIsEmpty(category.children);
      }
    }
  }
}

function testCategoryMenuField(
  wrapper: ReactWrapper,
  panel: CategoryListWrapper,
  expectedValue: TemplateMenu
) {
  const items = panel.find(".category-list").find(BlmCategoryListItem);

  items.forEach((item) => {
    const category = item.props().data;

    expect(category.menu).toEqual(expectedValue);

    if (hasSubCategory(category)) {
      simulateCategoryItemClick(item);

      //wrapper.find is used to get updated state of item after clicking
      const updatedItem = wrapper.find({ data: category });

      testCategoryMenuField(wrapper, updatedItem, expectedValue);
    }
  });
}

function testTemplatesScope(
  categories: TemplateCategory[] | Template[],
  templateScope: TemplateScope
) {
  if (categories) {
    for (let category of categories) {
      if (isCategory(category)) {
        testTemplatesScope(category.children, templateScope);
      } else {
        expect(category.type).toEqual("template");
        expect(category.scope).toContain(templateScope);
      }
    }
  }
}

function testTemplateContext(
  categories: TemplateCategory[] | Template[],
  context?: TemplateContext
) {
  if (categories && context) {
    for (let category of categories) {
      if (isCategory(category)) {
        testTemplateContext(category.children, context);
      } else {
        expect(category.type).toEqual("template");
        //expect(category.context).toMatch(context);
      }
    }
  }
}

function simulateCategoryItemClick(wrapper: CategoryItemWrapper) {
  const itemBox = wrapper.find(".category-list-item-box");
  itemBox.simulate("click");
}
