"use server";

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

  // TODO: Wire up to a real backend (CMS entry, email service, etc.)
  return { success: true, email: email.trim() };
}
