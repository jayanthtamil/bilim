import {
  CompletionType,
  CourseDisplay,
  CourseExportOrientation,
  CourseExportPrerequisite,
  CourseExportTypes,
  EvaluationType,
  LMSExportPackage,
  LMSExportVesrion,
  NavigationType,
} from "editor-constants";
import { CourseElement } from "./element";
import { EvaluationFeedbackProps } from "./element-props";
import { CMSFolder } from "./file";
import { StyleNavigationConfig } from "./styles";

export class CourseStructure {
  starting?: CourseElement;
  structure?: CourseElement;
  annexes?: CourseElement;
}

export class CourseProps {
  id: string;
  title: string;
  display: CourseDisplay;
  parent: CMSFolder | null = null;
  type?: string;
  description = "";
  shortDescription = "";
  displayCourseName= "";
  keywords = "";
  objectives = "";
  language = "";
  duration = "";
  version = "";
  navigation?: CourseNavigationProps;
  completion = new CourseCompletionProps();
  evaluation = new CourseEvaluationProps();
  texts: CourseExternalText[] = [];
  files: CourseExternalFile[] = [];
  propsJSON: CoursePropsJSON | null = null;
  isEvaluation = false;
  hasFeedback = false;
  metadatas?: string;
  noOfWords?: string;
  taxonomy?: string;
  thumbnail?: string;
  urlEdit?: string;
  created = { user: "", date: "" };
  modified = { user: "", date: "" };

  constructor(id: string, title: string, display: CourseDisplay) {
    this.id = id;
    this.title = title;
    this.display = display;
  }
}

export class CourseNavigationProps implements StyleNavigationConfig {
  type = NavigationType.None;
  typelist = [] as NavigationType[];
  burger = false;
  styleloader = false;
  screenmenu = false;
  navigationlevel = 0;
  toclevel = 1;
  screensontoc = false;
  linear = false;
  prerequisite = false;
}

class CompletionActionProps {
  all_button_clicked: boolean = false;
  video_complete: boolean = false;
  sound_complete: boolean = false;
  animation_complete: boolean = false;
  interaction_complete: boolean = false;
  timer: boolean = false;
  timer_duration: number = 5;
}

export class CourseCompletionProps {
  completion = CompletionType.ScreenDisplayed;
  actions = new CompletionActionProps();
}

export class ChapterEvaluationFeedbackProps extends EvaluationFeedbackProps {}

export class CourseFeedbackOptions {
  by_question = true;
  global = false;
}

export class CourseAdvancedProps {
  show_as_complete_even_if_no_succeed = false;
  all_sub_eval_succeed_for_validate = false;
}

export class CourseEvaluationProps {
  evaluation = EvaluationType.None;
  save_in_lms = true;
  success_score = 80;
  feedback = new ChapterEvaluationFeedbackProps();
  proposition_feedback = new CourseFeedbackOptions();
  question_feedback = new CourseFeedbackOptions();
  advanced = new CourseAdvancedProps();
}

export interface CourseExternalText {
  name: string;
  value: string;
  comment: string;
}

export interface CourseExternalFile {
  id: string;
  name: string;
  path: string;
}

export interface CoursePropsJSON {
  linkedElements?: {
    evaluations?: string[];
  };
}

export interface CoursePropsComponent {
  label?: string;
  data: CourseProps;
  onChange: CoursePropsChangeHandler;
}

export interface CoursePropsChangeHandler {
  (properties: CourseProps): void;
}

export class CourseExport {
  type: CourseExportTypes;
  options: CourseLMSExport | CourseWebExport;

  constructor(type: CourseExportTypes, options: CourseLMSExport | CourseWebExport) {
    this.type = type;
    this.options = options;
  }
}

export class CourseLMSExport {
  version = LMSExportVesrion.Default;
  pkg = LMSExportPackage.Full;
  prerequisite = CourseExportPrerequisite.Default;
  orientation = CourseExportOrientation.Free;
  exit = false;
}

export class CourseWebExport {
  prerequisite = CourseExportPrerequisite.Default;
  orientation = CourseExportOrientation.Free;
}

export interface CourseExportComponent {
  label?: string;
  onExport?: (event: CourseExport) => void;
}
