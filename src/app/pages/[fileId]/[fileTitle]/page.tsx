import { ALLOWED_VISIBILITIES_FOR_WEBPAGE, isAllowedVisibilityForWebpage } from "@lib/constants";
import { getAllPosts, getFileById, getPostById, ServerPostWithFiles } from "@lib/server/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getURLFriendlyTitle } from "@app-lib/get-url-friendly-title";

export default async function FilePage({
  params,
}: {
  params: {
    fileId: string;
  };
}) {
  const { fileId: id } = params;

  const file = await getFileById(id);

  if (!file || !isAllowedVisibilityForWebpage(file.post.visibility)) {
    return notFound();
  }

  return (
    <main className="dark:prose-invert mx-auto max-w-3xl px-4 dark:bg-gray-800">
      <h1 className="prose-2xl text-foreground">{file.title}</h1>
      <hr className="border-foreground my-4" />
      <article dangerouslySetInnerHTML={{ __html: new TextDecoder("utf-8").decode(file.html) }} className="dark:prose-dark prose" />
    </main>
  );
}

export async function generateStaticParams() {
  const posts = (await getAllPosts({
    select: {
      id: true,
      files: {
        // include where visibility is public or unlisted
        // and title ends with .md
        where: {
          title: {
            endsWith: ".md",
          },
        },
      },
    },
    where: {
      visibility: {
        in: ALLOWED_VISIBILITIES_FOR_WEBPAGE,
      },
    },
  })) as ServerPostWithFiles[];

  return posts.flatMap((post) => {
    return post.files.map((file) => ({
      fileId: file.id,
      fileTitle: getURLFriendlyTitle(file.title),
    }));
  });
}

export async function generateMetadata({
  params,
}: {
  params: {
    fileId: string;
  };
}): Promise<Metadata> {
  const { fileId: postId } = params;
  const post = await getPostById(postId, {
    select: {
      description: true,
      title: true,
    },
  });

  return {
    title: post?.title || "",
    description: post?.description || "",
  };
}
