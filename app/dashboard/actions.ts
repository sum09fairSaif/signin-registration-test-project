"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const allowedGenders = new Set(["male", "female", "other"]);

export async function updateProfile(formData: FormData) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return {
      success: false,
      error: "You need to be logged in to update your profile.",
    };
  }

  const name = formData.get("name")?.toString().trim() ?? "";
  const ageValue = formData.get("age")?.toString().trim() ?? "";
  const genderValue = formData.get("gender")?.toString().trim().toLowerCase() ?? "";
  const imageValue = formData.get("image")?.toString().trim() ?? "";
  const homeAddressValue = formData.get("homeAddress")?.toString().trim() ?? "";
  const workAddressValue = formData.get("workAddress")?.toString().trim() ?? "";
  const bioValue = formData.get("bio")?.toString().trim() ?? "";

  if (!name || name.length < 2) {
    return {
      success: false,
      error: "Name must be at least 2 characters long.",
    };
  }

  const age = ageValue ? Number(ageValue) : null;

  if (ageValue && (!Number.isInteger(age) || age < 13 || age > 120)) {
    return {
      success: false,
      error: "Age must be a whole number between 13 and 120.",
    };
  }

  if (genderValue && !allowedGenders.has(genderValue)) {
    return {
      success: false,
      error: "Choose Male, Female, or Other.",
    };
  }

  if (homeAddressValue.length > 180) {
    return {
      success: false,
      error: "Home address must be 180 characters or fewer.",
    };
  }

  if (workAddressValue.length > 180) {
    return {
      success: false,
      error: "Work address must be 180 characters or fewer.",
    };
  }

  if (bioValue.length > 280) {
    return {
      success: false,
      error: "Short bio must be 280 characters or fewer.",
    };
  }

  if (imageValue) {
    const isDataImage = imageValue.startsWith("data:image/");

    if (!isDataImage) {
      try {
        new URL(imageValue);
      } catch {
        return {
          success: false,
          error: "Profile picture must be a valid image upload.",
        };
      }
    }
  }

  await prisma.user.update({
    where: { email },
    data: {
      name,
      age,
      gender: genderValue || null,
      image: imageValue || null,
      homeAddress: homeAddressValue || null,
      workAddress: workAddressValue || null,
      bio: bioValue || null,
    },
  });

  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Profile updated successfully.",
  };
}
