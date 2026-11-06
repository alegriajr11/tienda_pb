import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { SolicitarOtpDto } from './dto/solicitar-otp.dto';
import { LoginOtpDto } from './dto/login-otp.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ) { }

    async register(registerDto: RegisterDto) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

        const newUser = await this.usuariosService.create({
            ...registerDto,
            password: hashedPassword,
        })

        return {
            message: 'Usuario registrado exitosamente',
            user: newUser,
        }
    }

    async login(loginDto: LoginDto) {
        //1. Buscar el usuario por email
        const usuario = await this.usuariosService.findByEmail(loginDto.email, true)

        if (!usuario) {
            throw new UnauthorizedException(`El correo no existe`)
        }

        //2. Validar que la cuenta este activa
        if (!usuario.activo) {
            throw new UnauthorizedException(`La cuenta no se encuentra activa`)
        }

        //3. Comparar la contraseña enviada desde el dto con el hash de la BD
        const passwordValido = await bcrypt.compare(
            loginDto.password, //Este es el atributo del DTO
            usuario.password //Este es el hash de la BD
        )

        if (!passwordValido) {
            throw new UnauthorizedException(`Credenciales invalidas`)
        }

        //4. Crear el Payload del JWT
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol?.nombre
        }

        //5. Firmar el token
        const token = await this.jwtService.signAsync(payload);

        return {
            message: "Inicio de Sesion exitoso",
            access_token: token,
        }
    }

    async solicitarOtp(solicitarOtpDto: SolicitarOtpDto) {
        const usuario = await this.usuariosService.findByEmail(solicitarOtpDto.email);

        if (!usuario) {
            throw new UnauthorizedException('El correo no existe');
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.usuariosService.saveOtpCode(usuario.id, otpCode, otpExpiresAt);
        await this.mailService.sentOtpEmail(usuario.email, otpCode);

        return {
            message: 'Código OTP enviado exitosamente',
        };
    }

    async loginOtp(loginOtpDto: LoginOtpDto) {
        const usuario = await this.usuariosService.findByEmail(loginOtpDto.email);

        if (!usuario || !usuario.activo) {
            throw new UnauthorizedException('Credenciales invalidas');
        }

        if (
            !usuario.otpCode ||
            usuario.otpCode !== loginOtpDto.codigoOtp ||
            !usuario.otpExpiresAt ||
            usuario.otpExpiresAt.getTime() <= Date.now()
        ) {
            throw new UnauthorizedException('El código OTP es inválido o ha expirado');
        }

        const payload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol?.nombre,
        };
        const token = await this.jwtService.signAsync(payload);

        await this.usuariosService.clearOtpCode(usuario.id);

        return {
            message: 'Inicio de sesión exitoso',
            access_token: token,
        };
    }
}
