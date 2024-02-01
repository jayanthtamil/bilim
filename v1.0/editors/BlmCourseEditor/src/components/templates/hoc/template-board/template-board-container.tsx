import { connect, ConnectedProps } from "react-redux";

import { CourseElement } from "types";
import { RootState } from "redux/types";
import {
  openStructurePanel,
  closeStructurePanel,
  getCourseStructure,
  getElementTemplates,
  saveTemplates,
  duplicateElementTemplate,
  deleteElementTemplate,
  positionElementTemplate,
  renameElement,
  openConfirmDialog,
  getCurrnetElement,
  previewTemplates,
  getCurrentTemplates,
  removeFiles,
  clearFiles,
  toggleInteraction,
  updateElementTemplates,
} from "redux/actions";

const mapStateToProps = (state: RootState, props: { element: CourseElement }) => {
  const {
    editor: {
      core: {
        templatesPanel: { templates: displayTemplates },
        structurePanel,
      },
    },
  } = state;
  const { element } = props;

  return {
    curElement: getCurrnetElement(state, element)!,
    templates: getCurrentTemplates(state, element),
    displayTemplates,
    structurePanel,
  };
};

const mapDispatchToProps = {
  getCourseStructure,
  openStructurePanel,
  closeStructurePanel,
  getElementTemplates,
  saveTemplates,
  previewTemplates,
  duplicateElementTemplate,
  deleteElementTemplate,
  positionElementTemplate,
  renameElement,
  removeFiles,
  clearFiles,
  openConfirmDialog,
  toggleInteraction,
  updateElementTemplates,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector;
