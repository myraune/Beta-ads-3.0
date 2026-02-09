const RAW_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === "/") {
    return "";
  }

  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}

export function withBasePath(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`withBasePath expected an absolute path, received "${path}"`);
  }

  const basePath = normalizeBasePath(RAW_BASE_PATH);
  return basePath ? `${basePath}${path}` : path;
}
