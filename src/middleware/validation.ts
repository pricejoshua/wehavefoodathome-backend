import { Request, Response, NextFunction } from 'express';
import { isValidUUID, isValidBarcode, validationError, validationErrors } from '../utils/validation';

/**
 * Middleware to validate UUID parameter
 */
export function validateUUIDParam(paramName: string = 'id') {
    return (req: Request, res: Response, next: NextFunction) => {
        const value = req.params[paramName];

        if (!value || !isValidUUID(value)) {
            return res.status(400).json(validationError(paramName, `Invalid UUID format for ${paramName}`));
        }

        next();
    };
}

/**
 * Middleware to validate barcode parameter
 */
export function validateBarcodeParam(req: Request, res: Response, next: NextFunction) {
    const barcode = req.params.barcode;

    if (!barcode || !isValidBarcode(barcode)) {
        return res.status(400).json(
            validationError('barcode', 'Invalid barcode format. Must be 8-14 digits')
        );
    }

    next();
}

/**
 * Middleware to validate required query parameters
 */
export function validateQueryParams(...requiredParams: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const missing = requiredParams.filter(param => !req.query[param]);

        if (missing.length > 0) {
            return res.status(400).json({
                error: `Missing required query parameters: ${missing.join(', ')}`
            });
        }

        next();
    };
}
