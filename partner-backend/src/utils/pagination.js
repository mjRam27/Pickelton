export function pagination(query) {
  const page = Math.max(Number.parseInt(query.page ?? "0", 10) || 0, 0);
  const size = Math.min(Math.max(Number.parseInt(query.size ?? "20", 10) || 20, 1), 100);
  return { page, size, offset: page * size };
}

export function pageResult(rows, total, page, size) {
  const totalElements = Number(total);
  const totalPages = Math.ceil(totalElements / size);
  return { content: rows, page, size, totalElements, totalPages, last: page + 1 >= totalPages };
}
