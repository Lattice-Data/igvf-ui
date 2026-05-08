const mockGetObject = jest.fn();
const mockGetCollection = jest.fn();
const mockIsResponseSuccess = jest.fn();

jest.mock("../attribution", () => jest.fn(() => Promise.resolve({})));
jest.mock("../breadcrumbs", () => ({
  getBreadcrumbMeta: jest.fn(() => Promise.resolve(null)),
}));
jest.mock("../errors", () => ({
  errorObjectToProps: jest.fn((error) => ({ props: { error } })),
}));
jest.mock("../query-utils", () => {
  const actual = jest.requireActual("../query-utils");
  return {
    ...actual,
    isJsonFormat: jest.fn((query) => query.format === "json"),
  };
});
jest.mock("../fetch-request", () => {
  const FetchRequest = jest.fn().mockImplementation(() => ({
    getObject: mockGetObject,
    getCollection: mockGetCollection,
  }));
  FetchRequest.isResponseSuccess = mockIsResponseSuccess;
  return FetchRequest;
});

import { getServerSideProps } from "../../pages/[...path]";

describe("pages/[...path] canonical redirects", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsResponseSuccess.mockReturnValue(true);
  });

  it("preserves format=json when redirecting to canonical @id", async () => {
    mockGetObject.mockResolvedValue({
      union: () => ({
        "@id": "/analysis-sets/IGVFDS0000AAAA/",
        "@type": ["AnalysisSet", "Item"],
      }),
    });

    const result = await getServerSideProps({
      req: { headers: { cookie: "" } },
      resolvedUrl: "/IGVFDS0000AAAA/?format=json",
      query: { format: "json" },
    });

    expect(result).toEqual({
      redirect: {
        destination: "/analysis-sets/IGVFDS0000AAAA/?format=json",
        permanent: true,
      },
    });
  });

  it("uses canonical @id directly for non-json redirects", async () => {
    mockGetObject.mockResolvedValue({
      union: () => ({
        "@id": "/analysis-sets/IGVFDS0000AAAA/",
        "@type": ["AnalysisSet", "Item"],
      }),
    });

    const result = await getServerSideProps({
      req: { headers: { cookie: "" } },
      resolvedUrl: "/IGVFDS0000AAAA/",
      query: {},
    });

    expect(result).toEqual({
      redirect: {
        destination: "/analysis-sets/IGVFDS0000AAAA/",
        permanent: true,
      },
    });
  });
});
