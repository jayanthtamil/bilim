//https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
export enum MIMEType {
  JPEG = "image/jpeg",
  PNG = "image/png",
  JPG = "image/jpg",
  GIF = "image/gif",
  SVG = "image/svg+xml",
  MPEG = "audio/mpeg",
  MP4 = "video/mp4",
  WEBM = "video/webm",
  ZIP = "application/zip",
  ZIP_COMPRESSED = "application/x-zip-compressed",
  JSON = "application/json",
}

export enum AcceptedFileTypes {
  Image = ".jpg,.jpeg,.png,.gif,.svg",
  Video = ".mp4",
  Audio = ".mp3",
  Webm = ".webm",
  Zip = ".zip,.rar,.7z",
  Doc = ".doc,.pdf,.xls,.ppt",
  JSON = ".json",
  Image360MainMedia = ".jpg,.jpeg,.png,.gif",
  Vtt = ".vtt",
}

export enum CMSFolderTypes {
  Domain = "domain",
  DomainContentRoot = "domain_content_root",
  ContentFolder = "content_folder",
}
