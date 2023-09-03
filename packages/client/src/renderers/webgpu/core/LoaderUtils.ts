export namespace LoaderUtils {
  export const decodeText = (array: BufferSource) => new TextDecoder().decode(array);

  export const extractUrlBase = (url: string) => {
    const index = url.lastIndexOf('/');
    if (index === -1) return './';
    return url.slice(0, index + 1);
  };

  const patterns = {
    relative: { path: /^https?:\/\//i, url: /^\//, snip: /(^https?:\/\/[^\/]+).*/i },
    absolute: /^(https?:)?\/\//i,
    uri: /^data:.*,.*$/i,
    blob: /^blob:.*$/i,
  };
  const { uri, blob, absolute, relative } = patterns;
  export const resolveUrl = (url: string, path: string) => {
    if (relative.path.test(path) && relative.url.test(url)) path = path.replace(relative.snip, '$1');
    if (absolute.test(url)) return url;
    if (blob.test(url)) return url;
    if (uri.test(url)) return url;
    return path + url;
  };
}
