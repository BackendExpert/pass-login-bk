import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLog, AuditLogSchema } from "src/auditlogs/schema/auditlog.schema";
import { Role, RoleSchema } from "src/role/schema/role.schema";
import { User, UserSchema } from "src/user/schema/user.schema";
import { PassRest, PassRestSchema } from "./schema/pass-reset.schema";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { EmailService } from "src/common/utils/email.util";

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>("JWT_SECRET");
                console.log("JWT_SECRET loaded:", !!secret);
                return { secret, signOptions: { expiresIn: "1d" } };
            }
        }),

        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: PassRest.name, schema: PassRestSchema },
        ])
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, EmailService ],
    exports: [AuthService, JwtModule],   
    
})

export class AuthModule { }