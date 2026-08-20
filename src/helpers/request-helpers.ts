import type { Request } from "express";

export const getListFromRequestBody = (
  req: Request,
  listName: string
): string[] => {
  let list: string[] = [];
  if (req.body[listName]) {
    if (Array.isArray(req.body[listName])) {
      list = list.concat(req.body[listName]);
    } else {
      list.push(req.body[listName]);
    }
  }
  return list;
};
