import {
  CourseElement,
  CourseElementProps,
  CourseElementTemplates,
  CourseElementTemplate,
  AssociatedTemplate,
  BackgroundProps,
  MediaFile,
  CompletionProps,
  ChapterEvaluationProps,
  PageEvaluationProps,
  CustomEvaluationProps,
  RetryQuizProps,
  BaseAdvancedProps,
  FeedbackOptions,
  RelatedToProps,
  TemplateOptionsJSON,
  PrerequisiteProps,
  TemplateScrollOptionsJSON,
  TemplateScroll,
} from "types";
import {
  ElementType,
  BackgroundOptionTypes,
  TemplateTypes,
  ScrollTransitionTypes,
  BackgroundOption2Types,
  BackgroundSizeTypes,
} from "editor-constants";
import {
  ElementPropsResponse,
  ElementTemplateResponse,
  BackdropPropsResponse,
  ElementTemplatesResponse,
} from "../types";
import {
  toBoolean,
  toJSONString,
  toJSONObject,
  getElementBySelector,
  createRGBA,
  fromRgbaStr,
  hasChapterEvaluation,
  hasPageEvaluation,
  hasCustomEvaluation,
  isImage,
} from "utils";

export const createPropertiesAPI = (model: CourseElementProps) => {
  const result = {} as ElementPropsResponse;

  //General
  result.nid = model.id;
  result.type = model.type;
  result.title = model.name;
  result.title2 = model.subTitle;
  result.description = model.description;
  result.duration = model.duration;
  result.media_param = toJSONString(model.mediaJSON);
  result.nav_temp = toJSONString(model.navigationJSON);
  result.metadatas = toJSONString(model.metadatasJSON);
  result.hasassociatecontent = model.hasAssociateContent.toString();
  result.stylesummary = model.styleSummary.toString();
  result.screenonsummary = (model.screenSummary || false).toString();

  //Completion
  result.cust_comp = model.isCompletion.toString();
  result.cust_comp_param = toJSONString(model.completionJSON);

  //Prerequisite
  result.cust_prereq_param = toJSONString(model.prerequisiteJSON);

  //Evaluation
  result.theme_ref = model.theme;
  result.isevaluation = model.isEvaluation.toString();
  result.hasfeedback = model.hasFeedback.toString();
  result.eval_param = toJSONString(model.evalutionJSON);

  //Background
  result.bgm_param = createBackgroundAPI(model.backgroundJSON);

  //Files
  result.files_param = toJSONString(model.filesJSON);

  //Props
  result.props_param = toJSONString(model.propsJSON);

  return result;
};

export const createPropertiesModel = (response: ElementPropsResponse, element: CourseElement) => {
  const result = new CourseElementProps(response.nid, response.title, response.type as ElementType);

  //General
  result.level = element.level;
  result.subTitle = response.title2;
  result.description = response.description;
  result.duration = response.duration;
  result.mediaJSON = toJSONObject(response.media_param);
  result.navigationJSON = toJSONObject(response.nav_temp);
  result.metadatasJSON = toJSONObject(response.metadatas);
  result.hasAssociateContent = toBoolean(response.hasassociatecontent);
  result.styleSummary = response.stylesummary ? toBoolean(response.stylesummary) : true;
  result.screenSummary = response.screenonsummary ? toBoolean(response.screenonsummary) : undefined;

  //Completion
  result.isCompletion = toBoolean(response.cust_comp || "");
  result.completionJSON = toJSONObject(response.cust_comp_param);

  //Prerequisite
  result.prerequisiteJSON = toJSONObject(response.cust_prereq_param);

  //Evaluation
  result.theme = response.theme_ref;
  result.isDirectEvaluation = toBoolean(response.direct_evaluation);
  result.isEvaluation = toBoolean(response.isevaluation);
  result.hasFeedback = toBoolean(response.hasfeedback);

  result.evalutionJSON = toJSONObject(response.eval_param);

  //Background
  result.backgroundJSON = createBackgroundModel(response.bgm_param);

  //Files
  result.filesJSON = toJSONObject(response.files_param);

  //Porps
  result.propsJSON = toJSONObject(response.props_param);

  //Logs
  result.created = { user: response.changed_by, date: response.created };
  result.modified = { user: response.modified_by, date: response.changed };

  //Initialize
  if (!result.completionJSON) {
    result.completionJSON = new CompletionProps();
  }

  if (!result.prerequisiteJSON) {
    result.prerequisiteJSON = new PrerequisiteProps();
  }

  if (!result.evalutionJSON) {
    if (hasChapterEvaluation(result)) {
      result.evalutionJSON = new ChapterEvaluationProps();
    } else if (hasPageEvaluation(result)) {
      result.evalutionJSON = new PageEvaluationProps();
    } else if (hasCustomEvaluation(result)) {
      result.evalutionJSON = new CustomEvaluationProps();
    }
  } else if (hasChapterEvaluation(result) || hasPageEvaluation(result)) {
    //This is for old elements, we can delete this if database is cleared.
    if (hasChapterEvaluation(result)) {
      if (result.evalutionJSON.theme === undefined) {
        result.evalutionJSON.theme = result.theme;
      }
    }

    if (hasPageEvaluation(result)) {
      if (result.evalutionJSON.advanced === undefined) {
        result.evalutionJSON.advanced = new BaseAdvancedProps();
      }
    }

    if (!result.evalutionJSON.related_to) {
      result.evalutionJSON.related_to = new RelatedToProps();
    } else if (typeof result.evalutionJSON.related_to === "string") {
      result.evalutionJSON.related_to = new RelatedToProps(true, result.evalutionJSON.related_to);
    }

    if (result.evalutionJSON.feedback.checked === undefined) {
      result.evalutionJSON.feedback.checked = result.hasFeedback;
    }

    if (result.evalutionJSON.retry_quiz === undefined) {
      result.evalutionJSON.retry_quiz = new RetryQuizProps();
    }

    if (result.evalutionJSON.proposition_feedback === undefined) {
      result.evalutionJSON.proposition_feedback = new FeedbackOptions();
    }

    if (
      !(
        typeof result.evalutionJSON.question_feedback === "object" &&
        "by_question" in result.evalutionJSON.question_feedback
      )
    ) {
      result.evalutionJSON.question_feedback = new FeedbackOptions();
    }
  }

  if (
    !result.backgroundJSON &&
    (result.type === ElementType.Page || result.type === ElementType.SimplePage)
  ) {
    result.backgroundJSON = new BackgroundProps();
  }

  return result;
};

const createBackgroundAPI = (background: BackgroundProps | null) => {
  if (background) {
    const result: BackdropPropsResponse = {};
    const {
      media: { main, webm, image, tint, option, optionValue, option2 },
      tint: bgTint,
      mediaSize,
      colorSize,
    } = background;

    if (main) {
      result.path = main.url;
      result.tint = createRGBA(tint.color, tint.alpha);
      result.option1 = option;
      result.media_size = mediaSize;
      result.main = main;

      if (isImage(main.type)) {
        result.parallaxe =
          option === BackgroundOptionTypes.Parallax ? (optionValue as number) : undefined;
        result.option2 = option2;
      } else {
        result.pathwebm = webm?.url;
        result.paththumbnaill = image?.url;
        result.loop = Boolean(optionValue);
        result.webm = webm;
        result.image = image;
      }
    }

    if (bgTint.color) {
      result.color = createRGBA(bgTint.color, bgTint.alpha);
      result.color_size = colorSize;
    }

    return toJSONString(result);
  }

  return null;
};

const createBackgroundModel = (response: string | null) => {
  const background = toJSONObject<BackdropPropsResponse>(response);

  if (background) {
    const result = new BackgroundProps();
    const { media } = result;

    media.main = background.main;
    media.webm = background.webm;
    media.image = background.image;

    if (background.tint) {
      media.tint = fromRgbaStr(background.tint);
    }

    if (background.option1) {
      media.option = background.option1 as BackgroundOptionTypes;

      if (media.option === BackgroundOptionTypes.Autoplay) {
        media.optionValue = background.loop ?? false;
      } else {
        media.optionValue = background.parallaxe || 0;
      }
    }

    if (background.option2) {
      media.option2 = background.option2 as BackgroundOption2Types;
    }

    if (background.color) {
      result.tint = fromRgbaStr(background.color);
    }

    if (background.media_size) {
      result.mediaSize = background.media_size as BackgroundSizeTypes;
    }

    if (background.color_size) {
      result.colorSize = background.color_size as BackgroundSizeTypes;
    }

    return result;
  }

  return null;
};

export const createTemplatesModel = (
  response: ElementTemplatesResponse,
  element: CourseElement
) => {
  const { id = "", name = "", type = ElementType.Screen } = element;
  const result = new CourseElementTemplates(id, name, type);
  result.templates = [];

  if (element) {
    Object.assign(result, element);
  }

  if (Array.isArray(response.templates)) {
    for (let resTemplate of response.templates) {
      const template = createTemplateModel(resTemplate);

      result.templates.push(template);
    }
  } else if (response.templates && response.templates["template-type"]) {
    const template = createTemplateModel(response.templates);

    result.templates.push(template);
  }

  return result;
};

export const createTemplateModel = (response: ElementTemplateResponse) => {
  const {
    nid,
    name: title,
    type,
    "template-type": tempaleType,
    summary,
    html,
    htmlParam,
    template,
  } = response;
  const { id, name, light_url, dark_url } = template;
  const rootElement = getElementBySelector(html, `.outercontainer`);
  const isDarkTemplate = rootElement?.classList.contains("dark") || false;
  const scroll = rootElement?.getAttribute("blm-scroll-transition") || undefined;
  const scrollOption = toJSONObject<TemplateScrollOptionsJSON>(
    rootElement?.getAttribute("blm-scroll-option")
  );
  const hasAnchor = rootElement?.hasAttribute("anchor") || false;
  const associated = new AssociatedTemplate(id, name, light_url, dark_url);
  const result = new CourseElementTemplate(
    nid,
    title,
    type as TemplateTypes,
    tempaleType as TemplateTypes,
    html,
    associated,
    isDarkTemplate
  );

  result.options = toJSONObject<TemplateOptionsJSON>(rootElement?.getAttribute("blm-options"));
  result.scroll = new TemplateScroll(
    scroll as ScrollTransitionTypes,
    scrollOption?.fixedtransitioneffects,
    scrollOption?.parallaxecomponents
  );
  result.hasAnchor = hasAnchor;
  result.isSummary = toBoolean(summary);
  result.hasAction = hasAction(result.options);
  result.htmlJSON = toJSONObject(htmlParam);

  return result;
};

export const createDuplicateTemplatesAPI = (
  templates: CourseElementTemplate | CourseElementTemplate[]
) => {
  if (Array.isArray(templates)) {
    return { templates: templates.map(createDuplicatePageTemplateAPI) };
  } else {
    return createDuplicateScreenTemplateAPI(templates);
  }
};

const createDuplicateScreenTemplateAPI = (template1: any) => {
  const { template, html, htmlParam } = template1;
  return {
    template_id: template.id,
    template_type: template1["template-type"],
    html,
    htmlParam: toJSONString(htmlParam),
  };
};

const createDuplicatePageTemplateAPI = (template1: any) => {
  const { nid, name, template, summary, html, htmlJSON } = template1;
  return {
    id: nid,
    name,
    template_id: template.id,
    template_type: template1["template-type"],
    summary: summary.toString(),
    html,
    htmlParam: toJSONString(htmlJSON),
  };
};

export const createTemplatesAPI = (templates: CourseElementTemplate | CourseElementTemplate[]) => {
  if (Array.isArray(templates)) {
    return { templates: templates.map(createPageTemplateAPI) };
  } else {
    return createScreenTemplateAPI(templates);
  }
};

const createScreenTemplateAPI = (template1: CourseElementTemplate) => {
  const { template, templateType, html, htmlJSON } = template1;
  return {
    template_id: template.id,
    template_type: templateType,
    html,
    htmlParam: toJSONString(htmlJSON),
  };
};

const createPageTemplateAPI = (template1: CourseElementTemplate) => {
  const { id, name, template, templateType, isSummary, html, htmlJSON } = template1;
  return {
    id,
    name,
    template_id: template.id,
    template_type: templateType,
    summary: isSummary.toString(),
    html,
    htmlParam: toJSONString(htmlJSON),
  };
};

export const resetTemplatesAPI = (medias: MediaFile[]) => {
  const ids = medias.map((item) => item.id);

  return { medias: ids };
};

const hasAction = (options?: TemplateOptionsJSON | null) => {
  if (options) {
    const { onload, oncomplete } = options;

    return Boolean(
      onload?.hidenext ||
        onload?.hideprevious ||
        onload?.hideprevious ||
        onload?.opensimplecontent?.checked ||
        onload?.changebackground?.checked ||
        onload?.playsound?.checked ||
        onload?.stopsound?.checked ||
        onload?.playbackgroundsound?.checked ||
        onload?.stopbackgroundsound?.checked ||
        oncomplete?.keepnextkidden ||
        oncomplete?.showprevious ||
        oncomplete?.showhome ||
        oncomplete?.opensimplecontent?.checked ||
        oncomplete?.changebackground?.checked ||
        oncomplete?.playsound?.checked
    );
  }
  return false;
};
