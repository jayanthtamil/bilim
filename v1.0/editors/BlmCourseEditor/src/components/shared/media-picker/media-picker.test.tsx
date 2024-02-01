import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { defineFeature, loadFeature } from "jest-cucumber";

import { MediaFile } from "types";
import { AcceptedFileTypes, FileType } from "editor-constants";
import BlmMediaPicker, { CompProps } from "./BlmMediaPicker";

const feature = loadFeature("./upload-media.feature");

const file = new File(["(⌐□_□)"], "test.png", { type: "image/png" });
const mediaFile = new MediaFile("12", "test.jpg", FileType.JPG, "./test.jpg");

type CompReactWrapper = ReactWrapper<CompProps>;

function setup() {
  const props: CompProps = {
    elementId: "234",
    name: "default",
    media: null,
    acceptedFiles: [AcceptedFileTypes.Image],
    placeholder: "select a media",
    files: [],
    uploadFile: jest.fn(),
    removeFile: jest.fn(),
    deleteFile: jest.fn(),
    onChange: jest.fn(),
  };
  const wrapper = mount<CompProps>(<BlmMediaPicker {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Display preview of the uploaded media", ({ given, when, then, and }) => {
    given("Create Media Picker component", () => {});
    when("Browse button is displayed and File is selected", () => {
      hasPreviewImage(wrapper);
      hasVissibleBrowseButton(wrapper, true);
      hasPlaceHolder(wrapper, props.placeholder!);
      simulateFileClick(wrapper);
    });
    then("The file is uploaded to the store", () => {
      expect(props.uploadFile).toBeCalled();
    });
    and("After file is uploaded media removed from the store", () => {
      const uploaded = {
        id: "testuuid",
        media: mediaFile,
      };

      props.files = [uploaded];
      wrapper.setProps(props);

      expect(props.removeFile).toBeCalled();
      expect(props.onChange).toBeCalled();
    });
    and("Preview of the uploaded media is displayed in response", () => {
      props.media = mediaFile;
      wrapper.setProps(props);

      hasPreviewImage(wrapper, mediaFile);
    });
  });
});

function hasVissibleBrowseButton(wrapper: CompReactWrapper, isVisible: boolean) {
  const browseWrappper = wrapper.find(".browse-media-wrapper");
  const browseProps = browseWrappper.get(0).props;

  if (isVisible) {
    expect(browseProps).toMatchObject({ style: { display: "block" } });
  } else {
    expect(browseProps).toMatchObject({ style: { display: "none" } });
  }
}

function hasPlaceHolder(wrapper: CompReactWrapper, text: string) {
  const placeHolder = wrapper.find(".browse-media-placeholder");
  expect(placeHolder.text()).toMatch(text);
}

function simulateFileClick(wrapper: CompReactWrapper) {
  const fileInput = wrapper.find('input[type="file"]');
  fileInput.simulate("change", { target: { files: [file] } });
}

function hasPreviewImage(wrapper: CompReactWrapper, media?: MediaFile) {
  const image = wrapper.find(".image-media-wrapper img");
  const deleteBtn = wrapper.find(".preview-media-delete-btn");
  const name = wrapper.find(".preview-media-name");

  if (media) {
    expect(image).toHaveLength(1);
    expect(deleteBtn).toHaveLength(1);
    expect(name).toHaveLength(1);
    expect(image.prop("src")).toEqual(mediaFile.url);
    expect(name.text()).toEqual(mediaFile.name);
  } else {
    expect(image).toHaveLength(0);
    expect(deleteBtn).toHaveLength(0);
  }
}
