"use server";

import { prisma } from "@/lib/prisma";

type InquiryResult = {
  success: boolean;
  error?: string;
  email?: string;
};

export async function submitInquiry(
  dogId: string,
  formData: FormData
): Promise<InquiryResult> {
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const message = formData.get("message") as string | null;

  if (!name?.trim() || !email?.trim() || !phone?.trim() || !message?.trim()) {
    return { success: false, error: "All fields are required." };
  }

  try {
    await prisma.adoptionInquiry.create({
      data: {
        dogId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      },
    });

    return { success: true, email: email.trim() };
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
