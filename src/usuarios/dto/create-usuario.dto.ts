import { IsEmail, IsNotEmpty, IsNumber, IsString, Min, MinLength } from "class-validator";

export class CreateUsuarioDto {
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    @MinLength(6)
    password!: string;

    @IsNumber()
    @IsNotEmpty()
    rolId!: number;

}