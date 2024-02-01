import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { defineFeature, loadFeature } from "jest-cucumber";

import { CourseElementProps, CompletionProps } from "types";
import { ElementType, CompletionType } from "editor-constants";
import BlmCompletionProps, { CompProps } from "./BlmCompletionProps";

const feature = loadFeature("./completion.feature");

const data = new CourseElementProps("12", "Chapter", ElementType.Chapter);
data.completionJSON = new CompletionProps();

function setup() {
  const props: CompProps = {
    data: data,
    onChange: jest.fn(),
  };

  const wrapper = shallow(<BlmCompletionProps {...props} />);

  return { wrapper, props };
}

defineFeature(feature, (test) => {
  const { wrapper, props } = setup();

  test("Display Completion properties without options", ({ given, when, then }) => {
    given("Create Completion component", () => {});
    when("Custom completeness checkbox is not selected", () => {});
    then("No options is displayed", () => {
      assertChildren(wrapper, ".completeness-children-container", false);
    });
  });

  test("Display Completion properties with options", ({ given, when, then }) => {
    given("Create Completion component", () => {});
    when("Custom completeness checkbox is selected", () => {
      props.data.completionJSON!.completenessChecked = true;

      wrapper.setProps(props);
    });
    then("Options is displayed", () => {
      assertChildren(wrapper, ".completeness-children-container", true);
    });
  });

  test("Display Completion properties with action options", ({ given, when, then }) => {
    given("Create Completion component", () => {});
    when("Custom completeness by action is not selected", () => {});
    then("Action Options is not displayed", () => {
      assertChildren(wrapper, ".completion-action-children-container", false);
    });
    when("Custom completeness by action is selected", () => {
      props.data.completionJSON!.completeness = CompletionType.ByAction;

      wrapper.setProps(props);
    });
    then("Action Options is displayed", () => {
      assertChildren(wrapper, ".completion-action-children-container", true);
    });
  });

  test("Display Completion properties with action timer option", ({ given, when, then }) => {
    given("Create Completion component", () => {});
    when("Custom completeness by action timer is not selected", () => {});
    then("Timer text input is not displayed", () => {
      assertChildren(wrapper, ".completion-timer-container", false);
    });
    when("Custom completeness by action timer is selected", () => {
      props.data.completionJSON!.actions.timer = true;

      wrapper.setProps(props);
    });
    then("Timer text input is displayed", () => {
      assertChildren(wrapper, ".completion-timer-container", true);
    });
  });

  test("Completion properties should be saved", ({ given, when, then }) => {
    given("Create Completion component", () => {});
    when("Completion options are edited", () => {
      simulateChekcboxClick(wrapper, "completenessChecked", true);
      simulateRadioGroupClick(wrapper, "completeness", "by_action");
      simulateChekcboxClick(wrapper, "all_button_clicked", true);
      simulateChekcboxClick(wrapper, "video_complete", true);
      simulateChekcboxClick(wrapper, "sound_complete", true);
      simulateChekcboxClick(wrapper, "animation_complete", true);
      simulateChekcboxClick(wrapper, "interaction_complete", true);
      simulateChekcboxClick(wrapper, "timer", true);
      simulateTextInput(wrapper, "timer_duration", "23");
    });
    then("All edited options are saved", () => {
      expect(props.onChange).toHaveBeenCalledTimes(9);
    });
  });
});

function assertChildren(wrapper: ShallowWrapper, clsName: string, hasChildren: boolean) {
  const children = wrapper.find(clsName);

  if (hasChildren) {
    expect(children).toHaveLength(1);
  } else {
    expect(children).toHaveLength(0);
  }
}

function simulateRadioGroupClick(wrapper: ShallowWrapper, name: string, value: string) {
  const radio = wrapper.find(`[name="${name}"]`);

  radio.simulate("change", { target: { name, value } });
}

function simulateChekcboxClick(wrapper: ShallowWrapper, name: string, checked: boolean) {
  const checkbox = wrapper.find(`[name="${name}"]`);

  checkbox.simulate("change", { target: { type: "checkbox", name, checked } });
}

function simulateTextInput(wrapper: ShallowWrapper, name: string, value: string) {
  const txt = wrapper.find(`[name="${name}"]`);

  txt.simulate("change", { target: { name, value } });
}
