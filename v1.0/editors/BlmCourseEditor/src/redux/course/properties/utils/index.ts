import {
  CMSFolder,
  CourseCompletionProps,
  CourseEvaluationProps,
  CourseExport,
  CourseLMSExport,
  CourseProps,
  CourseWebExport,
} from "types";
import { CourseDisplay, CourseExportTypes } from "editor-constants";
import {
  getEvaluationPropsJSON,
  toBoolean,
  toBRs,
  toJSONObject,
  toJSONString,
  toNewLines,
} from "utils";
import { ContentFolderResponse, CoursePropsResponse } from "../types";

export const createPropertiesModel = (response: CoursePropsResponse) => {
  const result = new CourseProps(response.nid, response.title, response.dispaly as CourseDisplay);
  
  result.parent = createContentFolderModel(response.parent);
  result.type = response.type;
  result.description = response.desc ?? "";
  result.shortDescription = response.short_desc ?? "";
  result.keywords = response.keywords ?? "";
  result.objectives = response.objectives ?? "";
  result.duration = response.duration ?? "";
  result.language = response.language ?? "";
  result.version = response.crs_version ?? "";
  result.navigation = toJSONObject(response.nav_param) || undefined;
  result.completion = toJSONObject(response.comp_param) || new CourseCompletionProps();
  result.evaluation = toJSONObject(response.eval_param) || new CourseEvaluationProps();
  result.texts = toJSONObject(response.external_texts) || [];
  result.files = response.external_files || [];
  result.isEvaluation = toBoolean(response.isevaluation);
  result.hasFeedback = toBoolean(response.hasfeedback);
  result.metadatas = response.metadatas;
  result.noOfWords = response.no_of_words;
  result.taxonomy = response.taxonomy;
  result.thumbnail = response.thumbnail;
  result.urlEdit = response.url_edit;
  result.created = { user: response.created_by, date: response.created };
  result.modified = { user: response.modified_by, date: response.changed };

  //Initialize
  result.texts = result.texts.map((item) => ({ ...item, value: toBRs(item.value) }));
  result.propsJSON = getEvaluationPropsJSON(result.evaluation, result.propsJSON);
  result.displayCourseName = response.original_course_name;

  return result;
};

export const createPropertiesAPI = (model: CourseProps) => {
  const result = {} as CoursePropsResponse;

  result.title = model.title;
  result.desc = model.description;
  result.short_desc = model.shortDescription;
  result.keywords = model.keywords;
  result.objectives = model.objectives;
  result.language = model.language;
  result.duration = model.duration;
  result.crs_version = model.version;
  result.nav_param = toJSONString(model.navigation);
  result.comp_param = toJSONString(model.completion);
  result.eval_param = toJSONString(model.evaluation);
  result.isevaluation = model.isEvaluation.toString();
  result.hasfeedback = model.hasFeedback.toString();
  result.external_texts = toJSONString(
    model.texts.map((item) => ({ ...item, value: toNewLines(item.value) }))
  );
  result.original_course_name = model.displayCourseName;

  return result;
};

const createContentFolderModel = (response: ContentFolderResponse) => {
  if (response) {
    const folder = new CMSFolder(response.id, response.title);
    folder.type = response.type;
    folder.link = response.link;

    if (response.children && response.children.length > 0)
      folder.child = createContentFolderModel(response.children[0]);

    return folder;
  }
  return null;
};

export const createExportAPI = (id: string, model: CourseExport) => {
  const result: any = { crs_id: id };
  const { type, options } = model;

  if (type === CourseExportTypes.LMS) {
    const { version, pkg, exit, prerequisite, orientation } = options as CourseLMSExport;

    result.ex_options = "EXPORT LMS";
    result.version_select = version;
    result.package_select = pkg;
    result.prereq = prerequisite;
    result.orientation = orientation;
    result.exit = exit;
  } else {
    const { prerequisite, orientation } = options as CourseWebExport;

    result.ex_options = "EXPORT WEB";
    result.prereq = prerequisite;
    result.orientation = orientation;
  }

  return result;
};
