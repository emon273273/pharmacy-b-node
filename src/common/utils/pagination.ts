export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 10;

export function getPagination(query: any) {
  const page = Math.abs(parseInt(query.page ?? `${DEFAULT_PAGE}`, 10)) || DEFAULT_PAGE;
  const limit =
    Math.abs(parseInt(query.count ?? `${DEFAULT_PAGE_LIMIT}`, 10)) || DEFAULT_PAGE_LIMIT;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
