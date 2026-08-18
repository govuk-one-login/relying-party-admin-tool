export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return true;
};

export const protocolNotHttp = (url: string): boolean => {
  return !url.startsWith("http:");
};

export const isNotLocalhost = (url: string): boolean => {
  return !(url.includes("localhost") || url.includes("127.0.0.1"));
};
