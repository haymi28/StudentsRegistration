
import { z } from "zod";

export const getCreateClassSchema = () => z.object({
  name: z.string().min(1, { message: 'Class Name is required' }),
  managerId: z.string().min(1, { message: 'Class Manager is required' }),
});
