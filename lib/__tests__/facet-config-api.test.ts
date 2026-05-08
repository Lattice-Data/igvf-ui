import { HTTP_STATUS_CODE } from "../fetch-request";
import handler from "../../pages/api/facet-config/[uuid]";

const mockGetCacheClient = jest.fn();

jest.mock("../cache-client", () => ({
  getCacheClient: () => mockGetCacheClient(),
}));

describe("facet-config API GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with empty object when no saved facet config exists", async () => {
    const mockRedisClient = {
      hGet: jest.fn().mockResolvedValue(null),
    };
    mockGetCacheClient.mockResolvedValue(mockRedisClient);

    const req = {
      method: "GET",
      query: {
        uuid: "98fb23d3-0d79-4c3d-981d-01539e6589f1",
        type: "DropletBasedLibrary",
      },
    } as any;
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status } as any;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(HTTP_STATUS_CODE.OK);
    expect(json).toHaveBeenCalledWith({});
  });
});
