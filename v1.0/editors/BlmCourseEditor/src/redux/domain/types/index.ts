import {
  CategoryBase,
  TemplateBase,
  TemplateCategory,
  Theme,
  Template,
  TemplateVariant,
  Languages,
} from "types";
import { ApiResultAction } from "redux/types";

export interface DomainState {
  themes?: Theme[];
  languages?: Languages;
  templates?: TemplateCategory[];
}

export interface ThemeResponse
  extends Record<"nid" | "name" | "url" | "allowIntroduction", string> {}

export interface LanguageResponse {
  code: string;
  name: string;
  url?: string;
}

export interface LanguagesResponse {
  primary: Array<LanguageResponse>;
  others: Array<LanguageResponse>;
}

interface BaseResponse extends Omit<CategoryBase, "id"> {
  nid: string;
}

export interface TemplateCategoryResponse
  extends BaseResponse,
    Omit<TemplateCategory, "id" | "parent" | "children"> {
  children: TemplateCategoryResponse[] | TemplateResponse[];
}

export interface TemplateBaseResponse extends BaseResponse, Omit<TemplateBase, "id"> {}

export interface TemplateResponse
  extends TemplateBaseResponse,
    Omit<
      Template,
      | "id"
      | "parent"
      | "framework"
      | "displays"
      | "scopes"
      | "contexts"
      | "structureContexts"
      | "themes"
      | "interaction"
      | "switchable"
      | "substitue"
      | "variants"
    > {
  framework_min: string | null;
  framework_max: string | null;
  display: string;
  scope: string;
  context: string | null;
  course_context: string | null;
  theme: string | null;
  interaction: string | null;
  switchable: string | null;
  substitute_template: string | null;
  variants: TemplateVariantResponse[];
}

export interface TemplateVariantResponse
  extends TemplateBaseResponse,
    Omit<TemplateVariant, "id" | "parent"> {}

export const GET_THEMES_STARTED = "GET_THEMES_STARTED";
export const GET_THEMES_SUCCESS = "GET_THEMES_SUCCESS";
export const GET_THEMES_ERROR = "GET_THEMES_ERROR";

export const GET_LANGUAGES_STARTED = "GET_LANGUAGES_STARTED";
export const GET_LANGUAGES_SUCCESS = "GET_LANGUAGES_SUCCESS";
export const GET_LANGUAGES_ERROR = "GET_LANGUAGES_ERROR";

export const GET_TEMPLATES_STARTED = "GET_TEMPLATES_STARTED";
export const GET_TEMPLATES_SUCCESS = "GET_TEMPLATES_SUCCESS";
export const GET_TEMPLATES_ERROR = "GET_TEMPLATES_ERROR";

export const GET_TEMPLATE_PROPERTIES_STARTED = "GET_TEMPLATE_PROPERTIES_STARTED";
export const GET_TEMPLATE_PROPERTIES_SUCCESS = "GET_TEMPLATE_PROPERTIES_SUCCESS";
export const GET_TEMPLATE_PROPERTIES_ERROR = "GET_TEMPLATE_PROPERTIES_ERROR";

type GetThemesActions = ApiResultAction<
  typeof GET_THEMES_STARTED | typeof GET_THEMES_SUCCESS | typeof GET_THEMES_ERROR
>;

type GetLanguagesActions = ApiResultAction<
  typeof GET_LANGUAGES_STARTED | typeof GET_LANGUAGES_SUCCESS | typeof GET_LANGUAGES_ERROR
>;

type GetTemplatesActions = ApiResultAction<
  typeof GET_TEMPLATES_STARTED | typeof GET_TEMPLATES_SUCCESS | typeof GET_TEMPLATES_ERROR
>;

type GetTemplatePropertiesActions = ApiResultAction<
  | typeof GET_TEMPLATE_PROPERTIES_STARTED
  | typeof GET_TEMPLATE_PROPERTIES_SUCCESS
  | typeof GET_TEMPLATE_PROPERTIES_ERROR
>;

export type DomainActions =
  | GetThemesActions
  | GetLanguagesActions
  | GetTemplatesActions
  | GetTemplatePropertiesActions;
