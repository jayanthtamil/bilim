import React from "react";

import { CoursePropsComponent } from "types";
import BlmCourseStyleFile from "./file";
import "./styles.scss";

export interface CompProps extends Omit<CoursePropsComponent, "onChange"> {}

function BlmCourseStyleProps(props: CompProps) {
  const { data } = props;
  const { files } = data;

  return (
    <div className="course-style-props-container">
      <div className="course-style-file-list">
        {files.map((file) => (
          <BlmCourseStyleFile data={file} />
        ))}
      </div>
    </div>
  );
}

export default BlmCourseStyleProps;
