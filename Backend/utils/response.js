const responseFormatter = {
  success: (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  },
  
  error: (res, message = 'Error', statusCode = 500, errors = null) => {
    const response = {
      status: 'error',
      message
    };
  
    if (errors) {
      response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
  },
 
  pagination: (res, data, page, limit, total, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return res.status(200).json({
      status: 'success',
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  }
};

module.exports = responseFormatter;