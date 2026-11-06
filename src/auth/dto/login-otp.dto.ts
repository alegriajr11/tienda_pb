import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginOtpDto {
  @ApiProperty({
    description: 'Correo electrónico asociado a la cuenta',
    example: 'ana@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Código OTP recibido para iniciar sesión',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  codigoOtp!: string;
}