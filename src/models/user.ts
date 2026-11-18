export type User = {
  id: string;
  email: string;
  name: string;
};

export type UserEntry = {
  subject: `user:${string}`;
  sk: "user";
  email: string;
  name: string;
};
