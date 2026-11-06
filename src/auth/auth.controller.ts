import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginOtpDto } from './dto/login-otp.dto';
import { SolicitarOtpDto } from './dto/solicitar-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuarioEntity } from 'src/usuarios/entities/usuario.entity';
import { GetUser } from './decorators/get-user.decorator';

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

  @Post('solicitar-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar un código OTP por correo electrónico' })
  @ApiOkResponse({
    description: 'El código OTP fue enviado exitosamente.',
    schema: {
      example: { message: 'Código OTP enviado exitosamente' },
    },
  })
  @ApiBadRequestResponse({ description: 'El correo electrónico no es válido.' })
  @ApiUnauthorizedResponse({ description: 'El correo no existe.' })
  solicitarOtp(@Body() solicitarOtpDto: SolicitarOtpDto) {
    return this.authService.solicitarOtp(solicitarOtpDto);
  }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto)
    }

    @Post('login-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Iniciar sesión con correo y código OTP' })
    @ApiOkResponse({
        description: 'Inicio de sesión exitoso.',
        schema: {
            example: {
                message: 'Inicio de sesión exitoso',
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos.' })
    @ApiUnauthorizedResponse({ description: 'El código OTP es inválido, expiró o la cuenta no puede iniciar sesión.' })
    loginOtp(@Body() loginOtpDto: LoginOtpDto) {
        return this.authService.loginOtp(loginOtpDto);
    }

    //auth/perfil
    @Get('perfil')
    @UseGuards(JwtAuthGuard)
    getPerfil(@GetUser() usuario: UsuarioEntity) {
        return {
            message: 'Perfil del usuario autenticado con exito',
            user: usuario
        }
    }
}
