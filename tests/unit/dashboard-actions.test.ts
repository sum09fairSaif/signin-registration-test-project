import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { updateProfile } from "@/app/dashboard/actions";

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires an authenticated session", async () => {
    mocks.auth.mockResolvedValue(null);

    const formData = new FormData();
    formData.append("name", "Jane Doe");

    const result = await updateProfile(formData);

    expect(result).toEqual({
      success: false,
      error: "You need to be logged in to update your profile.",
    });
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects an out-of-range age", async () => {
    mocks.auth.mockResolvedValue({
      user: {
        email: "jane@example.com",
      },
    });

    const formData = new FormData();
    formData.append("name", "Jane Doe");
    formData.append("age", "10");
    formData.append("gender", "female");
    formData.append("image", "");
    formData.append("homeAddress", "");
    formData.append("workAddress", "");
    formData.append("bio", "");

    const result = await updateProfile(formData);

    expect(result).toEqual({
      success: false,
      error: "Age must be a whole number between 13 and 120.",
    });
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("updates the profile when the submitted data is valid", async () => {
    mocks.auth.mockResolvedValue({
      user: {
        email: "jane@example.com",
      },
    });
    mocks.prisma.user.update.mockResolvedValue({
      id: "user-1",
    });

    const formData = new FormData();
    formData.append("name", "Jane Doe");
    formData.append("age", "29");
    formData.append("gender", "female");
    formData.append("image", "data:image/png;base64,abc123");
    formData.append("homeAddress", "123 Main St");
    formData.append("workAddress", "456 Office Park");
    formData.append("bio", "Building secure products.");

    const result = await updateProfile(formData);

    expect(result).toEqual({
      success: true,
      message: "Profile updated successfully.",
    });
    expect(mocks.prisma.user.update).toHaveBeenCalledWith({
      where: { email: "jane@example.com" },
      data: {
        name: "Jane Doe",
        age: 29,
        gender: "female",
        image: "data:image/png;base64,abc123",
        homeAddress: "123 Main St",
        workAddress: "456 Office Park",
        bio: "Building secure products.",
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
