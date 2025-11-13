import * as z from "zod";
import { BaseSchema } from "@/app/models/base";

export const UserRoleSchema = BaseSchema.extend({
	uid: z.string(),
	role: z.enum(["admin", "driver", "user"])
});

export type UserRole = z.infer<typeof UserRoleSchema>;