"use client";

import { FormEvent, useState } from "react";
import { InputField } from "@/components/marketing";

type ContactFormState = {
  error?: string | null;
  fields?: {
    fullName: string;
    email: string;
    contactType: string;
    message: string;
  };
};

export function ContactForm() {
  const [state, setState] = useState<ContactFormState>({ error: null });
  const [isPending, setIsPending] = useState(false);

  const showError = state?.error === "missing-fields" || state?.error === "submit-failed";
  const errorMessage = state?.error === "missing-fields" 
    ? "Please fill in all required fields." 
    : "Something went wrong. Please try again later.";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const fields = {
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      contactType: String(formData.get("contactType") || ""),
      message: String(formData.get("message") || ""),
    };

    if (!fields.fullName || !fields.email || !fields.contactType || !fields.message) {
      setState({ error: "missing-fields", fields });
      setIsPending(false);
      return;
    }

    window.location.href = "/contact/success?mode=static";
  };

  return (
    <div className="w-full">
      {showError && (
        <p className="mb-6 rounded-2xl border-4 border-accent-4 bg-background/70 px-4 py-3 text-sm font-bold uppercase tracking-wide text-accent-3">
          {errorMessage}
        </p>
      )}
      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <InputField 
          label="Full name" 
          name="fullName" 
          defaultValue={state?.fields?.fullName}
          required 
        />
        <InputField 
          label="Email" 
          name="email" 
          type="email" 
          defaultValue={state?.fields?.email}
          required 
        />
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-accent-4">I am contacting as</span>
          <select
            name="contactType"
            required
            className="w-full rounded-full border-4 border-accent-3 bg-background px-5 py-3 text-white focus:outline-dashed"
            defaultValue={state?.fields?.contactType || ""}
          >
            <option value="" disabled>
              Select inquiry type
            </option>
            <option value="client">Client - I want to hire reps</option>
            <option value="rep">Outreach rep - I want to apply</option>
            <option value="partner">Partnership / general inquiry</option>
            <option value="support">Support request</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-accent-5">Message</span>
          <textarea
            name="message"
            required
            rows={5}
            defaultValue={state?.fields?.message}
            className="w-full rounded-3xl border-4 border-dashed border-accent-4 bg-background px-5 py-3 text-white focus:outline-dashed"
            placeholder="Share your timeline, target market, and current outreach goals."
          />
        </label>
        <button 
          className="max-button md:col-span-2 md:justify-self-start disabled:opacity-50 disabled:cursor-not-allowed" 
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Submitting..." : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}
