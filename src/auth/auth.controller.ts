import { Body, Controller, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";
import { LoginDTO } from "./dto/login.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Post('/register')
    Registation(
        @Body() dto: RegisterDto,
        @ClientInfoDecorator() client: ClientInfo,
    ) {
        return this.authService.Registation(
            dto,
            client.ipAddress,
            client.userAgent
        )
    }


    @Post('/login')
    Login(
        @Body() dto: LoginDTO,
        @ClientInfoDecorator() client: ClientInfo,
    ) {
        return this.authService.Login(
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/request-password-reset')
    PasswordReset(
        @Body('email') email: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        return this.authService.ForgetPassword(
            email,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/update-password')
    UpdatePassword(
        @Query('token') token: string,
        @Body() dto: UpdatePasswordDto,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        return this.authService.UpdatePassword(
            token,
            dto,
            client.ipAddress,
            client.userAgent
        )
    }
}