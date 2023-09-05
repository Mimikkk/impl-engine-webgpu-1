import { Cache } from './Cache.js';
import { Loader } from './Loader.js';
import { LoadingManager } from './LoadingManager.js';

const loading: Record<string, FileLoader.Handlers[]> = {};

class HttpError extends Error {
  response: any;

  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}

export class FileLoader extends Loader {
  responseType: FileLoader.ResponseType = 'text';
  mimeType: FileLoader.MimeType;

  constructor(manager: LoadingManager) {
    super(manager);
  }

  //@ts-expect-error
  load(url: string, handlers: FileLoader.Handlers = {}) {
    if (url === undefined) url = '';

    if (this.path !== undefined) url = this.path + url;

    url = this.manager.resolveURL(url);

    const cached = Cache.get(url);
    if (cached) {
      this.manager.itemStart(url);

      setTimeout(() => {
        handlers.onLoad?.(cached);
        this.manager.itemEnd(url);
      }, 0);

      return cached;
    }

    if (loading[url]) {
      loading[url].push(handlers);

      return;
    }
    loading[url] = [];
    loading[url].push(handlers);

    const req = new Request(url, {
      headers: new Headers(this.requestHeader),
      credentials: this.withCredentials ? 'include' : 'same-origin',
      // An abort controller could be added within a future PR
    });

    const mimeType = this.mimeType;
    const responseType = this.responseType;

    fetch(req)
      .then(response => {
        if (response.status === 200 || response.status === 0) {
          // Some browsers return HTTP Status 0 when using non-http protocol
          // e.g. 'file://' or 'data://'. Handle as success.

          if (response.status === 0) {
            console.warn('THREE.FileLoader: HTTP Status 0 received.');
          }

          // Workaround: Checking if response.body === undefined for Alipay browser #23548

          if (typeof ReadableStream === 'undefined' || !response.body?.getReader) return response;

          const callbacks = loading[url];
          const reader = response.body.getReader();

          // Nginx needs X-File-Size check
          // https://serverfault.com/questions/482875/why-does-nginx-remove-content-length-header-for-chunked-content
          const contentLength = response.headers.get('Content-Length') || response.headers.get('X-File-Size');
          const total = contentLength ? parseInt(contentLength) : 0;
          const lengthComputable = total !== 0;
          let loaded = 0;

          // periodically read data into the new stream tracking while download progress
          const stream = new ReadableStream({
            start(controller) {
              readData();

              function readData() {
                reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                  } else {
                    loaded += value.byteLength;

                    const event = new ProgressEvent('progress', { lengthComputable, loaded, total });
                    for (let i = 0, il = callbacks.length; i < il; i++) {
                      const callback = callbacks[i];
                      if (callback.onProgress) callback.onProgress(event);
                    }

                    controller.enqueue(value);
                    readData();
                  }
                });
              }
            },
          });

          return new Response(stream);
        } else {
          throw new HttpError(
            `fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`,
            response,
          );
        }
      })
      .then(response => {
        switch (responseType) {
          case 'arraybuffer':
            return response.arrayBuffer();

          case 'blob':
            return response.blob();

          case 'document':
            return response.text().then(text => {
              const parser = new DOMParser();
              return parser.parseFromString(text, mimeType);
            });

          case 'json':
            return response.json();

          default:
            if (mimeType === undefined) {
              return response.text();
            } else {
              // sniff encoding
              const re = /charset="?([^;"\s]*)"?/i;
              const exec = re.exec(mimeType);
              const label = exec && exec[1] ? exec[1].toLowerCase() : undefined;
              const decoder = new TextDecoder(label);
              return response.arrayBuffer().then(ab => decoder.decode(ab));
            }
        }
      })
      .then(data => {
        // Add to cache only on HTTP success, so that we do not cache
        // error response bodies as proper responses to requests.
        Cache.add(url, data);

        const callbacks = loading[url];
        delete loading[url];

        for (let i = 0, il = callbacks.length; i < il; i++) {
          const callback = callbacks[i];
          if (callback.onLoad) callback.onLoad(data);
        }
      })
      .catch(err => {
        // Abort errors and other errors are handled the same

        const callbacks = loading[url];

        if (callbacks === undefined) {
          // When onLoad was called and url was deleted in `loading`
          this.manager.itemError(url);
          throw err;
        }

        delete loading[url];

        for (let i = 0, il = callbacks.length; i < il; i++) {
          const callback = callbacks[i];
          if (callback.onError) callback.onError(err);
        }

        this.manager.itemError(url);
      })
      .finally(() => {
        this.manager.itemEnd(url);
      });

    this.manager.itemStart(url);
  }

  setResponseType(value: FileLoader.ResponseType) {
    this.responseType = value;
    return this;
  }

  setMimeType(value: FileLoader.MimeType) {
    this.mimeType = value;
    return this;
  }
}

export namespace FileLoader {
  export interface Handlers {
    onLoad?: (data: any) => void;
    onProgress?: (event: ProgressEvent) => void;
    onError?: (error: ErrorEvent) => void;
  }
  export type ResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
  export type MimeType = DOMParserSupportedType;
}
