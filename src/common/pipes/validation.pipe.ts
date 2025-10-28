import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        const { metatype } = metadata;

        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        const object = plainToInstance(metatype, value);
        const errors = await validate(object);

        if (errors.length > 0) {
            const messages = errors
                .map(err => Object.values(err.constraints || {}))
                .flat();

            throw new BadRequestException(`Validation failed: ${messages.join(', ')}`);
        }

        return object;
    }

    private toValidate(metatype: any): boolean {
        const primitiveTypes = [String, Boolean, Number, Array, Object];
        return !primitiveTypes.includes(metatype);
    }
}
