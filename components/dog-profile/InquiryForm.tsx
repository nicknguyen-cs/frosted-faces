"use client";

import { useActionState, useEffect } from "react";
import { submitInquiry } from "@/app/dogs/[slug]/actions";

type InquiryFormProps = {
  dogId: string;
  dogName: string;
  dogBreed: string;
  dogSize: string;
  dogAgeCategory: string;
};

const inputClasses =
  "w-full rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-pebble focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta";

export default function InquiryForm({ dogId, dogName, dogBreed, dogSize, dogAgeCategory }: InquiryFormProps) {
  const boundAction = submitInquiry.bind(null, dogId);
  const [state, formAction, isPending] = useActionState(
    async (_prev: { success: boolean; error?: string; email?: string } | null, formData: FormData) => {
      return boundAction(formData);
    },
    null
  );

  useEffect(() => {
    if (state?.success && state.email) {
      window.dataLayer?.push({
        event: "inquiry_submitted",
        email: state.email,
        dog_name: dogName,
        breed: dogBreed,
        size: dogSize,
        age_category: dogAgeCategory,
      });
    }
  }, [state, dogName, dogBreed, dogSize, dogAgeCategory]);

  if (state?.success) {
    return (
      <div
        id="inquiry"
        className="rounded-2xl bg-sage-light/20 px-6 py-10 text-center"
      >
        <p className="font-heading text-lg font-semibold text-charcoal">
          Thank you for your interest in {dogName}!
        </p>
        <p className="mt-2 text-sm text-stone">
          We&apos;ll review your inquiry and get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div id="inquiry" className="rounded-2xl bg-sand-100 p-6 sm:p-8">
      <h3 className="font-heading text-lg font-semibold text-charcoal mb-5">
        Interested in {dogName}?
      </h3>

      {state?.error && (
        <p className="mb-4 rounded-xl bg-terracotta/10 px-4 py-2.5 text-sm text-terracotta">
          {state.error}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="inq-name" className="sr-only">
            Your name
          </label>
          <input
            id="inq-name"
            name="name"
            type="text"
            placeholder="Your name"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="inq-email" className="sr-only">
            Email address
          </label>
          <input
            id="inq-email"
            name="email"
            type="email"
            placeholder="Email address"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="inq-phone" className="sr-only">
            Phone number
          </label>
          <input
            id="inq-phone"
            name="phone"
            type="tel"
            placeholder="Phone number"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="inq-message" className="sr-only">
            Message
          </label>
          <textarea
            id="inq-message"
            name="message"
            placeholder="Tell us why you'd be a great match..."
            rows={4}
            required
            className={inputClasses}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-terracotta px-7 py-3 text-base font-medium text-white transition-colors hover:bg-terracotta-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Send Inquiry"}
        </button>
      </form>
    </div>
  );
}
