import { UserData } from "./global"
import { ItemData } from "./item"

export interface ListData {
  id: string
  userId: UserData['id']
  title: string
  coverPath?: string
  fav?: boolean
  trash?: boolean
  //logs
  createdAt: Date
  updatedAt: Date
  configs: ListConfigs
  // templates: ItemLayoutTab
}

interface ListConfigs {
  aspectRatio: [number, number]; // [width, height]
}

// export interface templates {
//   main?: object // main layout
//   fieldTemplates?: fieldTemplates
//   apiTemplates?: (listApiType)[]
// }

// export interface fieldTemplates {
//   states?: itemProgressState[]
//   mainFields?: { name: string, bIsNumber: boolean }[]
//   extraFields?: { name: string }[]
//   links?: { name: string, logo_path?: string  }[]
//   badges?: { value: string, logo_path?: string }[]
// }

interface listApi {
  name: string
  baseURL: string
  template: ItemData
  /** Queries will build with '&' */
  queries?: { name: string, query: string }[]
  /** Routes will build with '/ */
  routes?: { name: string, route: string }[]
}

interface listApiSearch {
  searchQueries?: {
    /** name: name of the search such as 'Title' will be displayed as 'Search by Title' (only for display)*/
    name: string,
    /** query of the search */
    query: string
  }[]
  /** the value that will be used after picking an item from search results,
   *  it will pick the 'path' and place it raw in 'query', if no query is provided it will put it in 'baseURL/ {here}' */
  searchResultToItem: { path: string, query: string },
  /**Path to the Title inside the response result onject without including search object */
  searchTitlePath: string
  /**Path to the search result array in the API response */
  searchArrayPath: string
}

export type listApiWithSearchType = listApi & listApiSearch
export type listApiType = listApi | listApiWithSearchType
