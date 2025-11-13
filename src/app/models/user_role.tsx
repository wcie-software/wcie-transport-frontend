import * as z from "zod";
import { BaseDocument } from "@/app/models/base";

export const UserRoleSchema = BaseDocument.extend({
	uid: z.string(),
	role: z.enum(["admin", "driver", "user"])
});

export type UserRole = z.infer<typeof UserRoleSchema>;