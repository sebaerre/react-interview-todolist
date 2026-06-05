export const qk = {
  lists: () => ["todolists"] as const,
  items: (id: string) => ["todoitems", id] as const,
};
