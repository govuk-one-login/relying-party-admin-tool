export const populateUrlRoute = (
  url: string,
  replacements: string[]
): string => {
  const replacementsQueue = [...replacements];

  return url.replace(/:[^/]+/g, (match) => {
    // Take the first element out of the queue, or keep the original match if the array runs out
    return replacementsQueue.shift() ?? match;
  });
};
