import { MockResponseFunction } from "fetch-mock";
import { treeResponse } from "./tree-response";
import {
  chapterPropertiesResponse,
  evaluationPropertiesResponse,
} from "./chapter-properties-response";
import { templatesResponse } from "./templates-response";
import { emptyPartPageTemplateResponse } from "./partpage-templates-response";

const mockResponse: MockResponseFunction = (url, opts) => {
  let body,
    headers = { "content-type": "application/json" };
  if (url.indexOf("/api/course_tree") !== -1) {
    body = JSON.stringify(treeResponse);
  } else if (url.indexOf("/api/chapter/7526") !== -1) {
    body = JSON.stringify(chapterPropertiesResponse);
  } else if (url.indexOf("/api/chapter/2631") !== -1) {
    body = JSON.stringify(evaluationPropertiesResponse);
  } else if (url.indexOf("api/template/template") !== -1) {
    body = JSON.stringify(templatesResponse);
  } else if (url.indexOf("api/pp_template") !== -1) {
    body = JSON.stringify(emptyPartPageTemplateResponse);
  } else {
    body = JSON.stringify({
      status: false,
      message: "mock response not found",
    });
  }

  return { body, headers };
};

export { mockResponse };
