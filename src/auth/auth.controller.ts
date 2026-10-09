import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario' })
  @ApiCreatedResponse({
    description: 'El usuario fue registrado exitosamente.',
  })
  @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos.' })
  @ApiConflictResponse({
    description: 'El correo electrónico o el rol ya existe o no es válido.',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
