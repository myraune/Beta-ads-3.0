export function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === "/") {
    return "";
  }

  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}

export function getBasePath(): string {
  return normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
}

export function withBasePath(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (!path.startsWith("/")) {
    throw new Error(`withBasePath expected an absolute path, received "${path}"`);
  }

  const basePath = getBasePath();
  return basePath ? `${basePath}${path}` : path;
}
