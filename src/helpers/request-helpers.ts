export const getOptionalList = (optionalList?: string[] | string): string[] => {
  let list: string[] = [];
  if (optionalList) {
    if (Array.isArray(optionalList)) {
      list = list.concat(optionalList);
    } else {
      list.push(optionalList);
    }
  }
  return list;
};
