import * as z from "zod";

export const UserRoleSchema = z.object({
	uid: z.string(),
	role: z.enum(["admin", "driver", "user"])
});

export type UserRole = z.infer<typeof UserRoleSchema>;