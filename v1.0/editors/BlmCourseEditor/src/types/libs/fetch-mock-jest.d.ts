declare module "fetch-mock-jest" {
  import fetchMockNS from "fetch-mock";

  interface JFetchMockStatic extends fetchMockNS.FetchMockStatic {
    any();
  }

  declare var fetchMock: JFetchMockStatic;
  export = fetchMockNS;
}
