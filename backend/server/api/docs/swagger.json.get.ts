import { swaggerSpec } from '~~/server/utils/swagger';

export default defineEventHandler(() => {
  return swaggerSpec;
});
