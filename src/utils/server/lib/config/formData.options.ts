import { coverThumbnailsOptions } from "@/utils/lib/fileHandling/thumbnailOptions";
import { ProcessFormDataOptions } from "../processFormData";

export const $listFormOptions = (dir: string) => ({
    fields: {
      title: 'String',
      coverPath: 'String',
    },
    files: {
      coverPath: {
        dir,
        thumbnailOptions: coverThumbnailsOptions.listCover,
        aliases: ['cover']
      }
    }
  }) as ProcessFormDataOptions