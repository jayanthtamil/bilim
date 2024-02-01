import { CourseElementProps, CourseElementTemplates, CourseStructure, MediaFile } from "types";
import { ApiResultAction } from "redux/types";

export interface CourseElementState {
  properties: {
    [key: string]: CourseElementProps;
  };
  templates?: CourseElementTemplates;
  structures?: CourseStructure;
}

export interface ElementPropsResponse {
  nid: string;
  type: string;
  title: string;
  title2: string | null;
  description: string | null;
  theme_ref: string | null;
  duration: string | null;
  direct_evaluation: string | null;
  isevaluation: string | null;
  hasfeedback: string | null;
  hasassociatecontent: string | null;
  stylesummary: string | null;
  screenonsummary: string | null;
  cust_comp: string | null;
  media_param: string | null;
  bgm_param: string | null;
  nav_temp: string | null;
  metadatas: string | null;
  eval_param: string | null;
  cust_comp_param: string | null;
  cust_prereq_param: string | null;
  files_param: string | null;
  props_param: string | null;
  created: string;
  changed: string;
  changed_by: string;
  modified_by: string;
}

export interface AssociatedTemplateResponse {
  id: string;
  name: string;
  dark_url: string;
  light_url: string;
}

export interface ElementTemplateResponse {
  nid: string;
  name: string;
  type: string;
  "template-type": string;
  summary: string;
  html: string;
  htmlParam: string;
  template: AssociatedTemplateResponse;
}

export interface ElementTemplatesResponse {
  templates: ElementTemplateResponse | ElementTemplateResponse[];
}

export interface BackdropPropsResponse {
  main?: MediaFile;
  webm?: MediaFile;
  image?: MediaFile;
  path?: string;
  pathwebm?: string;
  paththumbnaill?: string;
  tint?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  position?: string;
  parallaxe?: number;
  loop?: boolean;
  media_size?: string;
  color?: string;
  color_size?: string;
}

export const GET_ELEMENT_PROPERTIES_STARTED = "GET_ELEMENT_PROPERTIES_STARTED";
export const GET_ELEMENT_PROPERTIES_SUCCESS = "GET_ELEMENT_PROPERTIES_SUCCESS";
export const GET_ELEMENT_PROPERTIES_ERROR = "GET_ELEMENT_PROPERTIES_ERROR";

export const UPDATE_ELEMENT_PROPERTIES_STARTED = "UPDATE_ELEMENT_PROPERTIES_STARTED";
export const UPDATE_ELEMENT_PROPERTIES_SUCCESS = "UPDATE_ELEMENT_PROPERTIES_SUCCESS";
export const UPDATE_ELEMENT_PROPERTIES_ERROR = "UPDATE_ELEMENT_PROPERTIES_ERROR";

export const CLEAR_ELEMENT_PROPERTIES = "CLEAR_ELEMENT_PROPERTIES";

export const GET_ELEMENT_TEMPLATES_STARTED = "GET_ELEMENT_TEMPLATES_STARTED";
export const GET_ELEMENT_TEMPLATES_SUCCESS = "GET_ELEMENT_TEMPLATES_SUCCESS";
export const GET_ELEMENT_TEMPLATES_ERROR = "GET_ELEMENT_TEMPLATES_ERROR";

export const GET_SELECTED_ELEMENT_TEMPLATES_STARTED = "GET_SELECTED_ELEMENT_TEMPLATES_STARTED";
export const GET_SELECTED_ELEMENT_TEMPLATES_SUCCESS = "GET_SELECTED_ELEMENT_TEMPLATES_SUCCESS";
export const GET_SELECTED_ELEMENT_TEMPLATES_ERROR = "GET_SELECTED_ELEMENT_TEMPLATES_ERROR";

export const UPDATE_ELEMENT_TEMPLATES_STARTED = "UPDATE_ELEMENT_TEMPLATES_STARTED";
export const UPDATE_ELEMENT_TEMPLATES_SUCCESS = "UPDATE_ELEMENT_TEMPLATES_SUCCESS";
export const UPDATE_ELEMENT_TEMPLATES_ERROR = "UPDATE_ELEMENT_TEMPLATES_ERROR";

export const UPDATE_DUPLICATE_IMAGE_STARTED = "UPDATE_DUPLICATE_IMAGE_STARTED";
export const UPDATE_DUPLICATE_IMAGE_SUCCESS = "UPDATE_DUPLICATE_IMAGE_SUCCESS";
export const UPDATE_DUPLICATE_IMAGE_ERROR = "UPDATE_DUPLICATE_IMAGE_ERROR";

export const DUPLICATE_ELEMENT_TEMPLATE_STARTED = "DUPLICATE_ELEMENT_TEMPLATE_STARTED";
export const DUPLICATE_ELEMENT_TEMPLATE_SUCCESS = "DUPLICATE_ELEMENT_TEMPLATE_SUCCESS";
export const DUPLICATE_ELEMENT_TEMPLATE_ERROR = "DUPLICATE_ELEMENT_TEMPLATE_ERROR";

export const DELETE_ELEMENT_TEMPLATE_STARTED = "DELETE_ELEMENT_TEMPLATE_STARTED";
export const DELETE_ELEMENT_TEMPLATE_SUCCESS = "DELETE_ELEMENT_TEMPLATE_SUCCESS";
export const DELETE_ELEMENT_TEMPLATE_ERROR = "DELETE_ELEMENT_TEMPLATE_ERROR";

export const POSITION_ELEMENT_TEMPLATE_STARTED = "POSITION_ELEMENT_TEMPLATE_STARTED";
export const POSITION_ELEMENT_TEMPLATE_SUCCESS = "POSITION_ELEMENT_TEMPLATE_SUCCESS";
export const POSITION_ELEMENT_TEMPLATE_ERROR = "POSITION_ELEMENT_TEMPLATE_ERROR";

export const RESET_ELEMENT_TEMPLATE_STARTED = "RESET_ELEMENT_TEMPLATE_STARTED";
export const RESET_ELEMENT_TEMPLATE_SUCCESS = "RESET_ELEMENT_TEMPLATE_SUCCESS";
export const RESET_ELEMENT_TEMPLATE_ERROR = "RESET_ELEMENT_TEMPLATE_ERROR";

export const GET_COPY_FROM_DOMAIN_LIST_STARTED = "GET_COPY_FROM_DOMAIN_LIST_STARTED";
export const GET_COPY_FROM_DOMAIN_LIST_SUCCESS = "GET_COPY_FROM_DOMAIN_LIST_SUCCESS";
export const GET_COPY_FROM_DOMAIN_LIST_ERROR = "GET_COPY_FROM_DOMAIN_LIST_ERROR";

export const GET_COPY_FROM_DOMAIN_CATEGORY_STARTED = "GET_COPY_FROM_DOMAIN_CATEGORY_STARTED";
export const GET_COPY_FROM_DOMAIN_CATEGORY_SUCCESS = "GET_COPY_FROM_DOMAIN_CATEGORY_SUCCESS";
export const GET_COPY_FROM_DOMAIN_CATEGORY_ERROR = "GET_COPY_FROM_DOMAIN_CATEGORY_ERROR";

export const GET_COPY_FROM_SUB_FOLDER_STARTED = "GET_COPY_FROM_SUB_FOLDER_STARTED";
export const GET_COPY_FROM_SUB_FOLDER_SUCCESS = "GET_COPY_FROM_SUB_FOLDER_SUCCESS";
export const GET_COPY_FROM_SUB_FOLDER_ERROR = "GET_COPY_FROM_SUB_FOLDER_ERROR";

export const GET_COPY_FROM_STRUCTURE_LIST_STARTED = "GET_COPY_FROM_STRUCTURE_LIST_STARTED";
export const GET_COPY_FROM_STRUCTURE_LIST_SUCCESS = "GET_COPY_FROM_STRUCTURE_LIST_SUCCESS";
export const GET_COPY_FROM_STRUCTURE_LIST_ERROR = "GET_COPY_FROM_STRUCTURE_LIST_ERROR";

type GetElementActions = ApiResultAction<
  | typeof GET_ELEMENT_PROPERTIES_STARTED
  | typeof GET_ELEMENT_PROPERTIES_SUCCESS
  | typeof GET_ELEMENT_PROPERTIES_ERROR
>;

type UpdateElementActions = ApiResultAction<
  | typeof UPDATE_ELEMENT_PROPERTIES_STARTED
  | typeof UPDATE_ELEMENT_PROPERTIES_SUCCESS
  | typeof UPDATE_ELEMENT_PROPERTIES_ERROR
>;

type ClearElementPropsAction = {
  type: typeof CLEAR_ELEMENT_PROPERTIES;
  payload: {
    id?: string;
  };
};

type GetElementTemplatesActions = ApiResultAction<
  | typeof GET_ELEMENT_TEMPLATES_STARTED
  | typeof GET_ELEMENT_TEMPLATES_SUCCESS
  | typeof GET_ELEMENT_TEMPLATES_ERROR
>;

type GetSelectedElementTemplatesActions = ApiResultAction<
  | typeof GET_SELECTED_ELEMENT_TEMPLATES_STARTED
  | typeof GET_SELECTED_ELEMENT_TEMPLATES_STARTED
  | typeof GET_SELECTED_ELEMENT_TEMPLATES_STARTED
>;

type UpdateElementTemplatesActions = ApiResultAction<
  | typeof UPDATE_ELEMENT_TEMPLATES_STARTED
  | typeof UPDATE_ELEMENT_TEMPLATES_SUCCESS
  | typeof UPDATE_ELEMENT_TEMPLATES_ERROR
>;

type UpdateDuplicateImageActions = ApiResultAction<
  | typeof UPDATE_DUPLICATE_IMAGE_STARTED
  | typeof UPDATE_DUPLICATE_IMAGE_SUCCESS
  | typeof UPDATE_DUPLICATE_IMAGE_ERROR
>;

type DuplicateElementTemplateActions = ApiResultAction<
  | typeof DUPLICATE_ELEMENT_TEMPLATE_STARTED
  | typeof DUPLICATE_ELEMENT_TEMPLATE_SUCCESS
  | typeof DUPLICATE_ELEMENT_TEMPLATE_ERROR
>;

type DeleteElementTemplatesActions = ApiResultAction<
  | typeof DELETE_ELEMENT_TEMPLATE_STARTED
  | typeof DELETE_ELEMENT_TEMPLATE_SUCCESS
  | typeof DELETE_ELEMENT_TEMPLATE_ERROR
>;

type PositionElementTemplatesActions = ApiResultAction<
  | typeof POSITION_ELEMENT_TEMPLATE_STARTED
  | typeof POSITION_ELEMENT_TEMPLATE_SUCCESS
  | typeof POSITION_ELEMENT_TEMPLATE_ERROR
>;

type ResetElementTemplatesActions = ApiResultAction<
  | typeof RESET_ELEMENT_TEMPLATE_STARTED
  | typeof RESET_ELEMENT_TEMPLATE_SUCCESS
  | typeof RESET_ELEMENT_TEMPLATE_ERROR
>;

type GetCopyFromDomainListActions = ApiResultAction<
  | typeof GET_COPY_FROM_DOMAIN_LIST_STARTED
  | typeof GET_COPY_FROM_DOMAIN_LIST_SUCCESS
  | typeof GET_COPY_FROM_DOMAIN_LIST_ERROR
>;

type GetCopyFromDomainCategoryActions = ApiResultAction<
  | typeof GET_COPY_FROM_DOMAIN_CATEGORY_STARTED
  | typeof GET_COPY_FROM_DOMAIN_CATEGORY_SUCCESS
  | typeof GET_COPY_FROM_DOMAIN_CATEGORY_ERROR
>;

type GetCopyFromSubFolderActions = ApiResultAction<
  | typeof GET_COPY_FROM_SUB_FOLDER_STARTED
  | typeof GET_COPY_FROM_SUB_FOLDER_SUCCESS
  | typeof GET_COPY_FROM_SUB_FOLDER_ERROR
>;

type GetCopyFromStructureListActions = ApiResultAction<
  | typeof GET_COPY_FROM_STRUCTURE_LIST_STARTED
  | typeof GET_COPY_FROM_STRUCTURE_LIST_SUCCESS
  | typeof GET_COPY_FROM_STRUCTURE_LIST_ERROR
>;

export type ElementActions =
  | GetElementActions
  | UpdateElementActions
  | ClearElementPropsAction
  | GetElementTemplatesActions
  | GetSelectedElementTemplatesActions
  | UpdateElementTemplatesActions
  | DuplicateElementTemplateActions
  | DeleteElementTemplatesActions
  | PositionElementTemplatesActions
  | UpdateDuplicateImageActions
  | ResetElementTemplatesActions
  | GetCopyFromDomainListActions
  | GetCopyFromDomainCategoryActions
  | GetCopyFromStructureListActions
  | GetCopyFromSubFolderActions;
