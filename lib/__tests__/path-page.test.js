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
  const mockGetObject = jest.fn();
  const mockGetCollection = jest.fn();
  const mockIsResponseSuccess = jest.fn();
  const FetchRequest = jest.fn(() => ({
    getObject: mockGetObject,
    getCollection: mockGetCollection,
  }));
  FetchRequest.isResponseSuccess = mockIsResponseSuccess;
  FetchRequest.__testMocks = {
    mockGetObject,
    mockGetCollection,
    mockIsResponseSuccess,
  };
  return FetchRequest;
});

// Use require() after mocks so hoisted jest.mock runs first; avoids TDZ with outer `const` mocks.
const FetchRequest = require("../fetch-request").default;
const { getServerSideProps } = require("../../pages/[...path]");

const { mockGetObject, mockIsResponseSuccess } = FetchRequest.__testMocks;

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
