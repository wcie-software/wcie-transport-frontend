import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const AdminSchema = BaseDocument.extend({
  email: z.email(),
});

export type Admin = z.infer<typeof AdminSchema>;
