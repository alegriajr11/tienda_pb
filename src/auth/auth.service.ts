import { Injectable } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly usuariosService: UsuariosService) {}

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
}
