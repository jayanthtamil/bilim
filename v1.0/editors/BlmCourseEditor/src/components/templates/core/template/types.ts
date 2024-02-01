import { HTMLAttributes } from "react";

import { CourseElementTemplate } from "types";

export interface TemplateCompProps extends HTMLAttributes<HTMLDivElement> {
  data: CourseElementTemplate;
  onTemplateEdit: (data: CourseElementTemplate) => void;
}
