import { join } from "node:path";

/**
 * Import a module from node_modules or current working directory.
 *
 * @param {string} cwd the current working directory.
 * @param {string} moduleName npm package name or path relative to cwd.
 *
 * @return {Promise<any>} the loaded module's default export.
 */
export const importModule = async (cwd, moduleName) => {
  const localModulePath = join(cwd, moduleName);
  try {
    return (await import(moduleName)).default;
  } catch (e) {
    try {
      return (await import(localModulePath)).default;
    } catch (e) {
      const error = new Error(`Cannot find module "${moduleName}" or "${localModulePath}".`);
      error.code = "MODULE_NOT_FOUND";
      throw error;
    }
  }
};
