class ApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T | null;

    constructor(
        statusCode: number,
        message = 'Success',
        data: T | null = null
    ) {
        this.statusCode = statusCode;
        this.success = true;
        this.message = message;
        this.data = data;
    }
}

export default ApiResponse;