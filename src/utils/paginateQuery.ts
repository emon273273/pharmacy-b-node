interface QueryParams {
  page?: string;
  count?: string;
}

interface PaginationResult {
  skip: number;
  limit: number;
}

const getPagination = (query: QueryParams): PaginationResult => {
  const page = parseInt(query.page || '1') || 1;
  const limit = parseInt(query.count || '10') || 10;
  const skip = (page - 1) * limit;

  return { skip, limit };
};

export default getPagination;
