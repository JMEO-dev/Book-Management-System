import { IsString, IsNotEmpty, IsISBN, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsISBN()
    @IsNotEmpty()
    isbn: string;

    @IsDateString()
    @IsOptional()
    publishedDate?: Date;

    @IsString()
    @IsOptional()
    genre?: string;

    @IsInt()
    @IsNotEmpty()
    authorId: number;
}
