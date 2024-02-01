import {
  ChapterEvaluationProps,
  CourseEvaluationProps,
  CoursePropsJSON,
  ElementPropsJSON,
  EvaluationFeedbackProps,
  MediaFile,
  PageEvaluationProps,
} from "types";
import { filterFalsy } from "../core";

function getEvaluationFeedbacks(feedback: EvaluationFeedbackProps) {
  return filterFalsy(feedback.thresholds.map((item) => item.feedback));
}

export function getEvaluationPropsJSON(
  evaluation: CourseEvaluationProps | ChapterEvaluationProps | PageEvaluationProps,
  props: CoursePropsJSON | ElementPropsJSON | null
) {
  const evaluations = getEvaluationFeedbacks(evaluation.feedback);

  if (evaluations.length || props?.linkedElements?.evaluations?.length) {
    return {
      ...props,
      linkedElements: { ...props?.linkedElements, evaluations },
    } as ElementPropsJSON;
  }

  return props;
}

export function getFilesPropsJSON(file: MediaFile | null, props: ElementPropsJSON | null) {
  if (file || props?.hasFiles !== undefined) {
    return {
      ...props,
      hasFiles: Boolean(file),
    } as ElementPropsJSON;
  }

  return props;
}
