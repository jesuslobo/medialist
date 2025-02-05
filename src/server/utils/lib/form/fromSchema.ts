import { THUMBNAILS_OPTIONS } from "@/utils/lib/fileHandling/thumbnailOptions";
import { ProcessFormDataBuilder } from "../processFormData";

const $LIST_FORM_SCHEMA = (dir: string) => ({
  title: 'String',
  trash: "Boolean",
  coverPath: {
    dir,
    thumbnailOptions: THUMBNAILS_OPTIONS.LIST_COVER,
    aliases: ['cover']
  }
}) as ProcessFormDataBuilder

const $ITEM_FORM_SCHEMA = (dir: string) => ({
  title: 'String',
  description: 'String',
  header: 'JSON',
  tags: 'JSON',
  layout: "JSON",
  trash: "Boolean",
  posterPath: {
    dir,
    thumbnailOptions: THUMBNAILS_OPTIONS.ITEM_POSTER,
    aliases: ['poster']
  },
  coverPath: {
    dir,
    thumbnailOptions: THUMBNAILS_OPTIONS.ITEM_COVER,
    aliases: ['cover']
  },
  logoPaths: {
    dir,
    thumbnailOptions: THUMBNAILS_OPTIONS.LOGO,
    attachTo: 'layout'
  }
}) as ProcessFormDataBuilder

export {
  $ITEM_FORM_SCHEMA,
  $LIST_FORM_SCHEMA
};

