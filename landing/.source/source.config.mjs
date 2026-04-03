// source.config.ts
import {
  defineCollections,
  defineConfig,
  defineDocs
} from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import {
  createFileSystemGeneratorCache,
  createGenerator,
  remarkAutoTypeTable
} from "fumadocs-typescript";
import * as z from "zod";
var docs = defineDocs({
  dir: "../docs/content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true
    },
    async: true
  }
});
var canaryDocs = defineDocs({
  dir: "../docs/content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true
    },
    async: true
  }
});
var blogCollection = defineCollections({
  type: "doc",
  dir: "../docs/content/blogs",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    draft: z.boolean().optional(),
    author: z.object({
      name: z.string(),
      avatar: z.string(),
      twitter: z.string().optional()
    }).optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional()
  }),
  postprocess: {
    includeProcessedMarkdown: true
  }
});
var generator = createGenerator({
  cache: createFileSystemGeneratorCache(".next/fumadocs-typescript")
});
var source_config_default = defineConfig({
  mdxOptions: {
    remarkNpmOptions: {
      persist: {
        id: "persist-install"
      }
    },
    remarkPlugins: [[remarkAutoTypeTable, { generator }]]
  },
  plugins: [lastModified()]
});
export {
  blogCollection,
  canaryDocs,
  source_config_default as default,
  docs
};
