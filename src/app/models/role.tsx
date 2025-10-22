import * as z from "zod";

export const Role = z.object({
	uid: z.string(),
	role: z.enum(["admin", "driver", "user"])
});