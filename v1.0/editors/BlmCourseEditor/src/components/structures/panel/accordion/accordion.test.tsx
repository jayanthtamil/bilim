import React from "react";
import { shallow } from "enzyme";
import { defineFeature, loadFeature } from "jest-cucumber";

import { CourseElement } from "types";
import { StructureType, ElementType } from "editor-constants";
import BlmCourseTree from "../course-tree";
import { AccordionSummary } from "./accordion-styles";
import BlmAccordion, { CompProps } from "./BlmAccordion";

const feature = loadFeature("./accordion.feature");

const element = new CourseElement("12", "Tree", ElementType.Chapter);

function setup() {
  const props: CompProps = {
    title: "Structure",
    treeType: StructureType.Structure,
    data: element,
    ctxItem: undefined,
    onOptionsClick: jest.fn(),
    onPanelChange: jest.fn(),
  };
  const wrapper = shallow<CompProps>(<BlmAccordion {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { wrapper, props } = setup();

  test("Display Accordion component with tree", ({ given, then, and }) => {
    const summary = wrapper.find(AccordionSummary);
    given("Accordion component", () => {});

    then("Title should be displayed", () => {
      expect(summary.text()).toEqual(props.title);
    });
    and("Panel shoule be open", () => {
      expect(summary.props().expanded).toEqual(true);
    });
    and("Tree should be displayed with given data", () => {
      const tree = wrapper.find(BlmCourseTree);

      expect(tree.props().treeType).toEqual(props.treeType);
      expect(tree.props().data).toEqual(props.data);
      expect(tree.props().ctxItem).toEqual(props.ctxItem);
    });
  });

  test("Display Accordion component with option icon", ({ given, when, and }) => {
    given("Accordion component", () => {});
    when("ctxItem prop is changed", () => {
      props.ctxItem = element;
      wrapper.setProps(props);
    });
    and("Option icon should be displayed", () => {
      let summary = wrapper.find(AccordionSummary);

      expect(summary.props().showOptionsIcon).toEqual(true);
    });
    and("Option icon click handler should be assigned", () => {
      let summary = wrapper.find(AccordionSummary);

      expect(summary.props().onOptionsClick).not.toBeNull();
    });
  });
});
