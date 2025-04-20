import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/utils/uploadthing";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
