export const esmImport = async name => {
  try {
    return (await import(name)).default;
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      error.code = 'MODULE_NOT_FOUND';
    }

    throw error;
  }
};
