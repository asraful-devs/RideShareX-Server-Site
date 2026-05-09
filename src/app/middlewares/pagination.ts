export interface PaginationQuery {
    page?: string | number;
    limit?: string | number;
    sortBy?: string;
    sortOrder?: string;
}

export const calculatePagination = (query: PaginationQuery) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    return { page, limit, skip, sortBy, sortOrder };
};
