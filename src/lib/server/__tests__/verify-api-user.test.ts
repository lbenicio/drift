import { prismaMock } from "@test/prisma.mock";

// Mock the prisma module
jest.mock("@lib/server/prisma", () => ({
  __esModule: true,
  get prisma() {
    return require("@test/prisma.mock").prismaMock;
  },
}));

import { verifyApiUser } from "@lib/server/verify-api-user";

// Mock the session module
jest.mock("@lib/server/session", () => ({
  getCurrentUser: jest.fn(),
}));

import { getCurrentUser } from "@lib/server/session";
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe("verifyApiUser", () => {
  const mockReq = {
    query: {},
    headers: {},
  } as any;
  const mockRes = {
    getHeader: jest.fn(),
    setHeader: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq.query = {};
    mockReq.headers = {};
  });

  it("returns null if there is no userId param or auth token", async () => {
    mockReq.query = {};
    mockReq.headers = {};
    const result = await verifyApiUser(mockReq, mockRes);
    expect(result).toBeNull();
  });

  it("returns the user id if there is a userId param and it matches the authenticated user id", async () => {
    mockReq.query = { userId: "123" };
    mockGetCurrentUser.mockResolvedValue({ id: "123" } as any);
    const result = await verifyApiUser(mockReq, mockRes);
    expect(mockGetCurrentUser).toHaveBeenCalledWith({ req: mockReq, res: mockRes });
    expect(result).toEqual("123");
  });

  it("returns null if there is a userId param but it doesn't match the authenticated user id", async () => {
    mockReq.query = { userId: "123" };
    mockGetCurrentUser.mockResolvedValue({ id: "456" } as any);
    const result = await verifyApiUser(mockReq, mockRes);
    expect(mockGetCurrentUser).toHaveBeenCalledWith({ req: mockReq, res: mockRes });
    expect(result).toBeNull();
  });

  it("returns the user id if there is an auth token and it is valid", async () => {
    mockReq.query = {};
    mockReq.headers = { authorization: "Bearer mytoken" };
    prismaMock.apiToken.findUnique.mockResolvedValue({
      userId: "123",
      expiresAt: new Date(Date.now() + 10000),
    } as any);
    const result = await verifyApiUser(mockReq, mockRes);
    expect(prismaMock.apiToken.findUnique).toHaveBeenCalledWith({
      where: { token: "mytoken" },
      select: { userId: true, expiresAt: true },
    });
    expect(result).toEqual("123");
  });
});
