import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "../trpc";
import { S3 } from "aws-sdk/clients/all";
import { env } from "../../../env/server.mjs";

const s3 = new S3({
  region: "eu-west-1",
  signatureVersion: "v4",
  accessKeyId: env.YOUR_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: env.YOUR_APP_AWS_ACCESS_KEY_ID,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

export const postRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
  }),
  createPost: protectedProcedure
    .input(
      z.object({
        fileType: z.string(),
        postTitle: z.string(),
        owner: z.string(),
        tags: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let fileName;

      const newPost = await ctx.prisma.$transaction(async (tx) => {
        let newPost = await tx.post.create({
          data: {
            title: input.postTitle,
            owner: input.owner,
            tags: input.tags,
            url: "placeholder",
          },
        });
        fileName = `${newPost.id}.${input.fileType}`;
        newPost = await tx.post.update({
          where: {
            id: newPost.id,
          },
          data: {
            url: `https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry${fileName}`,
          },
        });
        return newPost;
      });
      const signedUrl = s3.getSignedUrl("putObject", {
        Bucket: "misc-personal-projects",
        Key: `memecry${fileName}`,
        Expires: 500,
        ContentType: input.fileType,
        ACL: "public-read",
      });
      console.log(`Generated url ${signedUrl}`);
      return signedUrl;
    }),
});
