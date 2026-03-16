import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be under 200 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(320),
  company: z
    .string()
    .max(200, "Company name must be under 200 characters")
    .trim()
    .optional()
    .default(""),
  projectType: z.enum(
    [
      "Cloud Infrastructure",
      "Compliance & Security",
      "Software Development",
      "Business Automation",
      "Aviation Technology",
      "Other",
    ],
    { error: "Please select a valid project type" },
  ),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be under 5000 characters")
    .trim(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
