import React from "react";
import { ContainerProps } from "./copy-from-structure-container";
import BlmCourseTree from "components/structures/panel/course-tree/index";
import "./copy-from-structure-styles.scss";
import { CourseElement } from "types";

export interface CompPropss extends ContainerProps {
  courseId?: number;
  element?: CourseElement;
}

function BlmCopyFromStructure(props: CompPropss) {
  const { courseId, structures, element, getCopyFromStructureList } = props;
  const [courseTree, setCourseTree] = React.useState<any>();

  React.useEffect(() => {
    if (courseId) {
      getCopyFromStructureList(courseId).then((res) => {
        setCourseTree(res.payload);
      });
    }
  }, [courseId, getCopyFromStructureList]);

  if (structures?.structure) {
    return (
      <>
        {courseTree !== undefined && (
          <BlmCourseTree
            data={structures?.structure}
            treeType="CopyFrom"
            selectedElement={element}
            noClick={true}
            courseIdCopyFrom={courseId}
          />
        )}
      </>
    );
  } else {
    return null;
  }
}
export default BlmCopyFromStructure;
