import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { ReactWrapper } from "enzyme";
import { TreeNode } from "rc-tree";

import { StructureType, TAB_LABELS } from "editor-constants";
import { mountWithStore, actUpdateWrapper } from "tests/utils";
import App from "components/app";
import BlmStructurePanel from "components/structures/panel";
import BlmChapterElement from "components/elements/controls/chapter/BlmChapterElement";

const feature = loadFeature("./evaluation.feature");

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
  let wrapper: ReactWrapper;
  let mount;
  beforeAll(async () => {
    wrapper = setup().wrapper;
    await actUpdateWrapper(wrapper);
  });

  test("evalaution tab automatically selected on clicking an evaluation item", ({
    given,
    and,
    when,
    then,
  }) => {
    when("An evaluation element is selected in treeview", () => {
      const strcuturePanel = wrapper.find(BlmStructurePanel);
      const treeItem = getTreeItem(strcuturePanel, StructureType.Structure, "2631");
      expect(treeItem).toHaveLength(1);
      simulateTreeItemClick(treeItem);
      return actUpdateWrapper(wrapper);
    });
    then("The evaluation tab is selected automatically in properties panel", () => {
      const chapterPropertiesPanel = wrapper.find(BlmChapterElement);
      expect(chapterPropertiesPanel.find("Tabs").prop("selectedTabIndex")).toBe(2);
      expect(chapterPropertiesPanel.find("BlmEvaluationProps").length).toBe(1);
    });
  });

  test("As a user, I want to define a chapter as evaluation without previous data", ({
    given,
    and,
    when,
    then,
  }) => {
    let chapterPropertiesPanel: any;
    given("A chapter is selected", () => {
      const strcuturePanel = wrapper.find(BlmStructurePanel);
      const treeItem = getTreeItem(strcuturePanel, StructureType.Structure, "7526");
      expect(treeItem).toHaveLength(1);
      simulateTreeItemClick(treeItem);
      return actUpdateWrapper(wrapper);
    });
    and("The evaluation tab is selected", () => {
      chapterPropertiesPanel = wrapper.find(BlmChapterElement);
      expect(chapterPropertiesPanel.find("button").find(".MuiTab-wrapper").at(2).text()).toBe(
        TAB_LABELS.EVALUATION
      );
      chapterPropertiesPanel.find(".MuiTab-root").at(2).simulate("click");
    });
    and("no evaluation option is defined", () => {
      chapterPropertiesPanel.find("BlmEvaluationProps");
    });
    and("There are no previous stored evaluation data for this chapter", () => {});
    and("The chapter has already children elements", () => {});
    when("I select evaluation in the dropdown", () => {});
    then("The theme is automatically defined as no_theme", () => {});
    and("The evaluation options are displayed per default values", () => {});
    and("A feedback element is added as last children of the selected chapter", () => {});
    and("Display question mark icon in treeview at the right of the chapter", () => {});
  });

  test("As a user, I want to define a chapter as evaluation with previous data and feedback not present", ({
    given,
    and,
    when,
    then,
  }) => {
    given("A chapter is selected", () => {});
    and("The evaluation tab is selected", () => {});
    and("no evaluation option is defined", () => {});
    and("There are previous stored evaluation data for this chapter", () => {});
    and("Evaluation feedback is defined as NOT selected in the previous data", () => {});
    and("The chapter has already children elements", () => {});
    when("I select evaluation in the dropdown", () => {});
    then(
      "The theme is automatically defined as no_theme, whatever it was defined in the previous stored evaluation data",
      () => {}
    );
    and("The evaluation options are displayed as per the previous values", () => {});
    and("A feedback element is NOT added as last children of the selected chapter", () => {});
    and("Display question mark icon in treeview at the right of the chapter", () => {});
  });

  test("As a user, I want to define a chapter as evaluation with previous data and feedback present", ({
    given,
    and,
    when,
    then,
  }) => {
    given("A chapter is selected", () => {});
    and("The evaluation tab is selected", () => {});
    and("no evaluation option is defined", () => {});
    and("There are previous stored evaluation data for this chapter", () => {});
    and("Evaluation feedback is defined as selected in the previous data", () => {});
    and("The chapter has already children elements", () => {});
    when("I select evaluation in the dropdown", () => {});
    then(
      "The theme is automatically defined as no_theme, whatever it was defined in the previous stored evaluation data",
      () => {}
    );
    and("The evaluation options are displayed as per the previous values", () => {});
    and("A feedback element is added as last children of the selected chapter", () => {});
    and("Display question mark icon in treeview at the right of the chapter", () => {});
  });

  test("As a user, I want to define a chapter as evaluation with no previous data and feedback not present and themes list", ({
    given,
    and,
    when,
    then,
  }) => {
    given("A chapter is selected", () => {});
    and("The evaluation tab is selected", () => {});
    and("no evaluation option is defined", () => {});
    and("There are no previous stored evaluation data for this chapter", () => {});
    and("The chapter is empty", () => {});
    when("I select evaluation in the dropdown", () => {});
    then("The list of theme is displayed", () => {});
    and("The evaluation options are NOT displayed", () => {});
    and("A feedback element is NOT added as last children of the selected chapter", () => {});
    and("Display question mark icon in treeview at the right of the chapter", () => {});
  });

  test("As a user, I want to define a chapter as evaluation with previous data and feedback not present and themes list", ({
    given,
    and,
    when,
    then,
  }) => {
    given("A chapter is selected", () => {});
    and("The evaluation tab is selected", () => {});
    and("no evaluation option is defined", () => {});
    and("There are previous stored evaluation data for this chapter", () => {});
    and("The chapter is empty", () => {});
    and("Evaluation feedback is defined as NOT selected in the previous data", () => {});
    when("I select evaluation in the dropdown", () => {});
    then("The theme is defined as per the previous data", () => {});
    and("The evaluation options are displayed as per the previous values", () => {});
    and("A feedback element is NOT added as last children of the selected chapter", () => {});
    and("Display question mark icon in treeview at the right of the chapter", () => {});
  });

  test("As a user, I want to define a chapter as evaluation with previous data and feedback present and themes list", ({
    given,
    and,
    when,
    then,
  }) => {
    given("A chapter is selected", () => {});
    and("The evaluation tab is selected", () => {});
    and("no evaluation option is defined", () => {});
    and("There are previous stored evaluation data for this chapter", () => {});
    and("The chapter is empty", () => {});
    and("Evaluation feedback is defined as selected in the previous data", () => {});
    when("I select evaluation in the dropdown", () => {});
    then("The theme is defined as per the previous data", () => {});
    and("The evaluation options are displayed as per the previous values", () => {});
    and("A feedback element is added as last children of the selected chapter", () => {});
    and("Display question mark icon in treeview at the right of the chapter", () => {});
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
