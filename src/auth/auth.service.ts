import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { EmailService } from "src/common/utils/email.util";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { User, UserDocument } from "src/user/schema/user.schema";
import { RegisterDto } from "./dto/register.dto";
import bcrypt from 'bcrypt'
import { getLocationFromIP } from "src/common/utils/location";
import { createAuditLog } from "src/common/utils/auditlogs.util";
import { LoginDTO } from "./dto/login.dto";
import { PassRest, PassRestDocument } from "./schema/pass-reset.schema";
import { ConfigService } from "@nestjs/config";
import { UpdatePasswordDto } from "./dto/update-password.dto";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(AuditLog.name)
        private readonly auditlogModel: Model<AuditLogDocument>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<RoleDocument>,

        @InjectModel(PassRest.name)
        private readonly passresetModel: Model<PassRestDocument>,

        private jwtService: JwtService,
        private emailService: EmailService,
        private configService: ConfigService,
    ) { }

    async Registation(
        dto: RegisterDto,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const user = await this.userModel.findOne(
            {
                email: dto.email,
                username: dto.username
            }
        )

        if (user) {
            throw new ConflictException("User Already Exists")
        }

        const hashpass = await bcrypt.hash(dto.password, 10)

        const role = await this.roleModel.findOne({ role: 'user' })

        if (!role) {
            throw new NotFoundException("Role Cannot be found")
        }

        const location = getLocationFromIP(ipAddress || "");
        const safeIP = String(ipAddress || "0.0.0.0");

        const createUser = await this.userModel.create({
            username: dto.username,
            email: dto.email,
            password: hashpass,
            role: role._id,
            last_login: new Date(),
            login_ip: safeIP,
            account_stats: false,
        })

        await createAuditLog(this.auditlogModel, {
            user: createUser._id,
            action: "ACCOUNT_CREATED",
            description: `${dto.email} Created Account`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "Your Account Has been Created Success, Wait for Admin Approvel"
        }
    }

    async Login(
        dto: LoginDTO,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const user = await this.userModel.findOne({ email: dto.email }).populate('role');

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        if (user.account_stats === false) {
            throw new ConflictException("Your Account not Active by Admin, Please Cantact the Admin");
        }

        const location = getLocationFromIP(ipAddress || "");
        const safeIP = String(ipAddress || "0.0.0.0");

        user.last_login = new Date();
        user.login_ip = safeIP;

        await user.save();

        const accessToken = await this.jwtService.signAsync({
            sub: user._id,
            username: user.username,
            email: user.email,
            role: (user.role as any)?.role,
        });

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "LOGIN_SUCCESS",
            description: `${dto.email} user Login Success`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "Login Success",
            token: accessToken
        }
    }

    async ForgetPassword(
        email: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const user = await this.userModel.findOne({ email: email })

        if (!user) {
            throw new NotFoundException("User Cannot be Found")
        }

        const checkrequests = await this.passresetModel.deleteMany({ email: email })

        const resettoken = await this.jwtService.signAsync({
            sub: user._id,
            email: user.email,
            expire: new Date(Date.now() + 10 * 60 * 1000),
            type: "PASSWORD_RESET"
        });

        const hashtoken = bcrypt.hash(resettoken, 10)

        const createtoken = this.passresetModel.create({
            email: email,
            token: hashtoken,
            expireAt: new Date(Date.now() + 10 * 60 * 1000),
        })

        const frontendlink = this.configService.get<string>('FRONTEND_URL')
        const resetlink = `${frontendlink}/password-reset/token=?${resettoken}`;

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "REQUEST_PASSWORD_RESET",
            description: `${email} user Login Success`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });


        await this.emailService.sendPassresetLink(
            email,
            resetlink,
            ipAddress,
            userAgent,
        )

        return {
            success: true,
            message: "The Password Reset Link send to your Email Address"
        }
    }

    async UpdatePassword(
        token: string,
        dto: UpdatePasswordDto,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.email })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        if (payload.type === "PASSWORD_RESET") {
            throw new UnauthorizedException("Token is Invalid")
        }

        if (payload.expire > new Date()) {
            throw new UnauthorizedException("Your Password Reset Token Expired...")
        }

        const hashnewpass = await bcrypt.hash(dto.new_password, 10)

        const updateuser = await this.userModel.findOneAndUpdate(
            { email: payload.email },
            {
                password: hashnewpass
            },
            { new: true }
        )

        if (!updateuser) {
            throw new ConflictException("Error While Updating Password")
        }

        await this.emailService.NotificationEmail(
            payload.email,
            "Password Updated Success",
            ipAddress,
            userAgent
        )

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "UPDATE_PASSWORD_SUCCESS",
            description: `${payload.email} Password Updated Success`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "Password Update Success"
        }
    }
}