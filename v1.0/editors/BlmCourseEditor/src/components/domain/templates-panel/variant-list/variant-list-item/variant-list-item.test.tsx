import React from "react";
import { loadFeature, defineFeature } from "jest-cucumber";
import enzyme, { mount, ReactWrapper } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { TemplateVariant } from "types";
import { variants } from "../../template-list/mock-templates";
import BlmVariantListItem from "./BlmVariantListItem";

enzyme.configure({ adapter: new Adapter() });

const feature = loadFeature("./variant-list-item.feature");

const variant1 = variants[0];

function setup() {
  const props = {
    data: variant1,
    bgChecked: false,
    selected: false,
    onClick: jest.fn(),
  };
  const wrapper = mount(<BlmVariantListItem {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Variant list item is displayed", ({ given, when, then }) => {
    given("Variant list item", () => {});
    when("data is changed", () => {});
    then("Light image is displayed", () => {
      testImage(wrapper, variant1, false);
    });
  });

  test("Variant list item is displayed for background light and dark", ({
    given,
    and,
    when,
    then,
  }) => {
    given("Variant list item", () => {});
    and("Light image is displayed", () => {
      testImage(wrapper, variant1, false);
      testItemBox(wrapper, false);
    });
    when("Background dark is selected", () => {
      wrapper.setProps({ bgChecked: true });
    });
    then("Dark image is displayed", () => {
      testImage(wrapper, variant1, true);
      testItemBox(wrapper, true);
    });
  });

  test("Variant list item is selected", ({ given, and, when, then }) => {
    given("Variant list item", () => {});
    and("Variant item is not highlighted", () => {
      testIsSelected(wrapper, false);
    });
    when("Variant item is selected", () => {
      wrapper.setProps({ selected: true });
    });
    then("Variant item is highlighted", () => {
      testIsSelected(wrapper, true);
    });
  });

  test("Check variant item click handler are called", ({ given, when, then }) => {
    given("Varian list item", () => {});
    when("Variant lit item is clicked", () => {
      const imgBox = wrapper.find(".variant-item-img-box");
      imgBox.simulate("click");
    });
    then("Item click handler is called", () => {
      expect(props.onClick).toHaveBeenCalled();
    });
  });
});

function testImage(wrapper: ReactWrapper, variannt: TemplateVariant, isBgChecked: boolean) {
  const img = wrapper.find(".variant-item-img");
  const { name, thumbnailLight, thumbnailDark } = variannt;
  const src = isBgChecked ? thumbnailDark : thumbnailLight;

  expect(img.prop("src")).toEqual(src);
  expect(img.prop("alt")).toEqual(name);
}

function testItemBox(wrapper: ReactWrapper, isBgChecked: boolean) {
  const box = wrapper.find(".variant-item-box");

  expect(box.hasClass("dark")).toEqual(isBgChecked);
}

function testIsSelected(wrapper: ReactWrapper, isSelected: boolean) {
  const box = wrapper.find(".variant-item-box");

  expect(box.hasClass("selected")).toEqual(isSelected);
}
