/** Mirrors the `ArticleDto` of `api/article/*`. */
export interface ArticleDto {
  id: number;
  title: string;
}

/** Mirrors the `ArchitectureDto` of `api/architecture/*`. */
export interface ArchitectureDto {
  id: number;
  name: string;
}

/** Mirrors the `ArchitectureItemDto` of `api/architectureItem/*`. */
export interface ArchitectureItemDto {
  id: number;
  name: string;
}

/** Mirrors the `DigitalAssetDto` of `api/digitalasset/*`. */
export interface DigitalAssetDto {
  id: number;
  name: string;
}

/** Response of `POST api/digitalasset/upload`. */
export interface UploadResultDto {
  files: DigitalAssetDto[];
}
