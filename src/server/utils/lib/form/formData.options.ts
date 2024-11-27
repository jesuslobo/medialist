import { coverThumbnailsOptions } from "@/utils/lib/fileHandling/thumbnailOptions";
import { ProcessFormDataOptions } from "../processFormData";

const $listFormOptions = (dir: string) => ({
  title: 'String',
  coverPath: {
    dir,
    thumbnailOptions: coverThumbnailsOptions.listCover,
    aliases: ['cover']
  }
}) as ProcessFormDataOptions

const $itemFormOptions = (dir: string) => ({
  title: 'String',
  description: 'String',
  header: 'JSON',
  tags: 'JSON',
  layout: "JSON",
  posterPath: {
    dir,
    thumbnailOptions: coverThumbnailsOptions.itemPoster,
    aliases: ['poster']
  },
  coverPath: {
    dir,
    thumbnailOptions: coverThumbnailsOptions.itemCover,
    aliases: ['cover']
  },
  logoPaths: {
    dir,
    thumbnailOptions: coverThumbnailsOptions.logo,
    attachTo: 'layout'
  }
}) as ProcessFormDataOptions

export {
  $itemFormOptions,
  $listFormOptions
};

