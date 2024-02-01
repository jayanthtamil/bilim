import { CourseStructure, CourseElement, ElementConnection, AssociatedTemplate } from "types";
import { ElementType, ConnectionType, TemplateTypes } from "editor-constants";
import { forEachStructure, isValidLinkedElement, toBoolean, toJSONObject } from "utils";
import {
  CourseStructureResponse,
  ElementResponse,
  ConnectionResponse,
  BaseAssociatedTemplateResponse,
} from "../types";

export function createCourseStructureModel(response: CourseStructureResponse) {
  const { starting, structure, annexes } = response;
  const result = new CourseStructure();
  const linkedIds: string[] = [];

  result.starting =
    starting && starting.length
      ? createElementModels(starting, linkedIds)[0]
      : new CourseElement("", "Starting", ElementType.Starting);
  result.structure =
    structure && structure.length
      ? createElementModels(structure, linkedIds)[0]
      : new CourseElement("", "Structrues", ElementType.Structure);
  result.annexes =
    annexes && annexes.length
      ? createElementModels(annexes, linkedIds)[0]
      : new CourseElement("", "Annexes", ElementType.Annexes);

  if (result) {
    forEachStructure(result, (item) => {
      if (isValidLinkedElement(item)) {
        item.isLinked = linkedIds.includes(item.id);
      }
    });
  }

  return result;
}

function createElementModels(
  responses: ElementResponse[],
  linkedIds: string[],
  root?: CourseElement,
  parent?: CourseElement,
  level: number = 0
) {
  const elements: CourseElement[] = [];

  if (responses) {
    for (let response of responses) {
      const element = new CourseElement(response.id, response.name, response.type as ElementType);
      element.level = level;
      element.theme = response.theme_ref;
      element.isDirectEvaluation = toBoolean(response.direct_evaluation);
      element.isEvaluation = toBoolean(response.isevaluation);
      element.hasFeedback = toBoolean(response.hasfeedback);
      element.hasAssociateContent = toBoolean(response.hasassociatecontent);
      element.isSummary = toBoolean(response.summary);
      element.styleSummary = response.styleSummary ? toBoolean(response.styleSummary) : true;
      element.templateType = response.template_type as TemplateTypes;
      element.template = createTemplateModel(response.template);
      element.connections = createConnectionModel(response.connections);
      element.root = root;
      element.parent = parent;
      element.children = createElementModels(
        response.children,
        linkedIds,
        root ?? element,
        element,
        level + 1
      );
      element.propsJSON = toJSONObject(response.props_param);
      element.htmlJSON = toJSONObject(response.htmlParam);

      if (element.propsJSON) {
        if (element.propsJSON.linkedElements?.evaluations?.length) {
          linkedIds.push(...element.propsJSON.linkedElements.evaluations);
        }
      }

      if (element.htmlJSON?.linkedElements) {
        if (element.htmlJSON.linkedElements.actions?.length) {
          linkedIds.push(...element.htmlJSON.linkedElements.actions);
        }
        if (element.htmlJSON.linkedElements.components?.length) {
          linkedIds.push(...element.htmlJSON.linkedElements.components);
        }
      }

      elements.push(element);
    }
  }

  return elements;
}

function createTemplateModel(response?: BaseAssociatedTemplateResponse) {
  if (typeof response === "object" && response.id) {
    const template = new AssociatedTemplate(response.id);
    template.interaction = toBoolean(response.interaction);
    template.theme = response.theme;
    template.framework = {
      min: response.framework_min || undefined,
      max: response.framework_max || undefined,
    };
    template.course_context = response.course_context;

    return template;
  }
}

function createConnectionModel(responses: ConnectionResponse[] | null) {
  if (responses) {
    var connections: ElementConnection[] = [];

    for (let response of responses) {
      connections.push(new ElementConnection(response.value as ConnectionType));
    }

    return connections;
  }
  return null;
}
