export const populateUrlRoute = (
  url: string,
  replacements: Record<string, string>
): string => {
  let urlToUpdate = url;
  Object.entries(replacements).forEach(([key, value]) => {
    urlToUpdate = urlToUpdate.replaceAll(key, value);
  });
  return urlToUpdate;
};
