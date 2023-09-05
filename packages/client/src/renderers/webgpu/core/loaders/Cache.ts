export namespace Cache {
  let enabled = false;
  let files: Record<string, any> = {};

  export const add = <T>(key: string, file: T): void => {
    if (!enabled) return;
    files[key] = file;
  };

  export const get = <T>(key: string): T | undefined => {
    if (!enabled) return;
    return files[key] as T;
  };

  export const remove = (key: string) => delete files[key];
  export const clear = () => (files = {});
}
