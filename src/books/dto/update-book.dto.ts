import { IsString, IsOptional, IsISBN, IsDateString, IsInt } from 'class-validator';

export class UpdateBookDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsISBN()
    @IsOptional()
    isbn?: string;

    @IsDateString()
    @IsOptional()
    publishedDate?: string;

    @IsString()
    @IsOptional()
    genre?: string;

    @IsInt()
    @IsOptional()
    authorId?: number;
}