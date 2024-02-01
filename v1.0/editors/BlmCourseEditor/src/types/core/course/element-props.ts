import {
  EvaluationType,
  EvaluationQuestionValidate,
  CompletionType,
  FeedbackDisplayType,
  BackgroundSizeTypes,
} from "editor-constants";
import { BackgroundMedia, Tint } from "../template-editor";
import { BaseCourseElement, CourseElement, ElementPropsJSON } from "./element";
import { MediaFile } from "./file";

export class CourseElementProps<
  E extends BaseEvaluationProps = BaseEvaluationProps
> extends BaseCourseElement {
  level = 0;
  theme: string | null = null;
  isDirectEvaluation = false;
  isEvaluation = false;
  hasAssociateContent = false;
  hasFeedback = false;
  isCompletion = false;
  styleSummary = true;
  subTitle: string | null = null;
  description: string | null = null;
  duration: string | null = null;
  screenSummary?: boolean;
  mediaJSON: MediaProps | null = null;
  metadatasJSON: MetadatasProps | null = null;
  navigationJSON: NavigationProps | null = null;
  backgroundJSON: BackgroundProps | null = null;
  evalutionJSON: E | null = null;
  completionJSON: CompletionProps | null = null;
  prerequisiteJSON: PrerequisiteProps | null = null;
  filesJSON: MediaFile | null = null;
  propsJSON: ElementPropsJSON | null = null;
  created = { user: "", date: "" };
  modified = { user: "", date: "" };
}

export class BaseEvaluationProps {
  evaluation = EvaluationType.None;
  save_in_lms = true;
  success_score = 80;
  retry_quiz = new RetryQuizProps();
}

export class FeedbackOptions {
  by_question = true;
  global = false;
}

export class ChapterEvaluationProps extends BaseEvaluationProps {
  theme: string | null = null;
  related_to = new RelatedToProps();
  feedback = new ChapterEvaluationFeedbackProps();
  timer = new EvaluationTimerProps();
  randomize_questions = new RandomizeQuestionsProps();
  proposition_feedback = new FeedbackOptions();
  question_feedback = new FeedbackOptions();
  advanced = new ChapterAdvancedProps();
}

export class PageEvaluationProps extends BaseEvaluationProps {
  related_to = new RelatedToProps();
  feedback = new PageEvaluationFeedbackProps();
  proposition_feedback = new FeedbackOptions();
  question_feedback = new FeedbackOptions();
  question_validate: EvaluationQuestionValidate = EvaluationQuestionValidate.OnePerQuestion;
  advanced = new BaseAdvancedProps();
}

export class CustomEvaluationProps extends BaseEvaluationProps {
  advanced = new BaseAdvancedProps();
}

export class RelatedToProps {
  checked = false;
  value = "";
  constructor(checked = false, value = "") {
    this.checked = checked;
    this.value = value;
  }
}

export interface Threshold {
  threshold: number;
  feedback: string;
}

export class RetryQuizProps {
  checked = true;
  attempts = "unlimited";
  lock_when_success = false;
}

export class EvaluationFeedbackProps {
  checked = false;
  thresholds: Threshold[] = [
    {
      threshold: 0,
      feedback: "",
    },
    {
      threshold: 80,
      feedback: "",
    },
  ];
}

class ChapterEvaluationFeedbackProps extends EvaluationFeedbackProps {}

class PageEvaluationFeedbackProps extends EvaluationFeedbackProps {
  display = FeedbackDisplayType.InPopup;
}

class EvaluationTimerProps {
  checked = false;
  value = 30;
}

class RandomizeQuestionsProps {
  checked = false;
  value = 0;
}

export class BaseAdvancedProps {
  show_as_complete_even_if_no_succeed = false;
}

class ChapterAdvancedProps extends BaseAdvancedProps {
  all_sub_eval_succeed_for_validate = false;
}

class CompletionActionProps {
  all_button_clicked = false;
  video_complete = false;
  sound_complete = false;
  animation_complete = false;
  interaction_complete = false;
  timer = false;
  timer_duration = 5;
}

export class CompletionProps {
  completion: CompletionType = CompletionType.None;
  actions = new CompletionActionProps();
}

export class PrerequisiteProps {
  checked = false;
  siblings?: string[];
}

export class BackgroundProps {
  media = new BackgroundMedia();
  tint = new Tint();
  mediaSize = BackgroundSizeTypes.Large;
  colorSize = BackgroundSizeTypes.Large;
}

export class MediaProps {
  default: MediaFile | null = null;
  over: MediaFile | null = null;
  overSound: MediaFile | null = null;
}

export class NavigationProps {
  [key: string]: MediaFile | null;
}

export class MetadatasProps {
  [key: string]: string | number | boolean | null;
}

export interface ElementPropsComponent<E extends BaseEvaluationProps = BaseEvaluationProps> {
  label?: string;
  data: CourseElementProps<E>;
  onChange: ElementPropsChangeHandler<E>;
}

export interface ElementPropsContainer<E extends BaseEvaluationProps = BaseEvaluationProps> {
  element: CourseElement;
  data: CourseElementProps<E>;
  onChange: ElementPropsChangeHandler<E>;
  onSave: () => void;
}

export interface ElementPropsChangeHandler<E extends BaseEvaluationProps = BaseEvaluationProps> {
  (properties: CourseElementProps<E>, forceSave?: boolean): void;
}
