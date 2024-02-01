import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { setJestCucumberConfiguration } from "jest-cucumber";
import fetchMock from "fetch-mock-jest";

import { mockResponse } from "tests/mocks";

//jest-cucumber.loadFeatures function to load from relative url
setJestCucumberConfiguration({
  loadRelativePath: true,
});

Enzyme.configure({ adapter: new Adapter() });

//@ts-ignore
fetchMock.any(mockResponse);

//https://github.com/mui-org/material-ui/issues/15726#issuecomment-493124813
//https://stackoverflow.com/questions/60333156/how-to-fix-typeerror-document-createrange-is-not-a-function-error-while-testi
global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  //@ts-ignore
  commonAncestorContainer: {
    nodeName: "BODY",
    ownerDocument: document,
  },
});

jest.mock("utils", () => {
  // Require the original module to not be mocked...
  const originalModule = jest.requireActual("utils");

  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    createUUID: jest.fn().mockReturnValue("testuuid"),
  };
});
