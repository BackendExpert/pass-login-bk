import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { createAuditLog } from "src/common/utils/auditlogs.util";
import { EmailService } from "src/common/utils/email.util";
import { getLocationFromIP } from "src/common/utils/location";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { User, UserDocument } from "src/user/schema/user.schema";

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(AuditLog.name)
        private readonly auditlogModel: Model<AuditLogDocument>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<RoleDocument>,

        private jwtService: JwtService,
        private emailService: EmailService,
        private configService: ConfigService,
    ) { }

    async ActivateDeActiveUser(
        token: string,
        userId: string,
        status: boolean,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.email })
        const location = getLocationFromIP(ipAddress || "");

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const targetUser = await this.userModel.findById(userId)

        if (!targetUser) {
            throw new NotFoundException("Target User Not Found")
        }

        const updateuserstatus = await this.userModel.findByIdAndUpdate(
            userId,
            {
                account_stats: status
            },
        )

        let notification = ""

        if (status === true) {
            await createAuditLog(this.auditlogModel, {
                user: user._id,
                action: "ACCOUNT_ACTIVATED",
                description: `${user.email} admin Update ${targetUser.email} as Active Account`,
                ipAddress,
                userAgent,
                metadata: {
                    ipAddress,
                    userAgent,
                    location,
                },
            });

            notification = "Your Account now Active";


        }
        else if (status === false) {
            await createAuditLog(this.auditlogModel, {
                user: user._id,
                action: "ACCOUNT_DEACTIVATED",
                description: `${user.email} admin Update ${targetUser.email} as Deactive Account`,
                ipAddress,
                userAgent,
                metadata: {
                    ipAddress,
                    userAgent,
                    location,
                },
            });

            notification = "Your Account now Deactive";

        }

        await this.emailService.NotificationEmail(
            targetUser.email,
            notification,
            ipAddress,
            userAgent,
        )

        return {
            success: true,
            message: "Account Status Update Success"
        }
    }

    async FetchAllusers(
        token: string
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.email })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const users = await this.userModel.find().populate('role')

        return {
            success: true,
            message: "All users Fetched Success",
            result: users
        }
    }

    async fetchUserbyId(
        token: string,
        id: string
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.email })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const targetUser = await this.userModel.findById(id).populate('role')

        if (!targetUser) {
            throw new NotFoundException("Target User Not found")
        }

        return {
            success: true,
            message: "User Fetched Success",
            result: targetUser
        }
    }

    async CreteNewRole(
        token: string,
        role: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.email })
        const location = getLocationFromIP(ipAddress || "");

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const checkrole = await this.roleModel.findOne({ role: role })

        if (checkrole) {
            throw new ConflictException('Role Already Added in the System')
        }

        const createRole = await this.roleModel.create({
            role: role
        })


        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "NEW_ROLE_CREATED",
            description: `${user.email} Create New Role ${role}`,
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
            message: "New Role Created Success"
        }
    }

    async FetchAllRoles(
        token: string
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.email })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const roles = await this.roleModel.find()

        return {
            success: true,
            message: "All Role Fetch Success",
            result: roles
        }
    }

    async FetchRoleById(
        token: string,
        id: string
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.email })

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const role = await this.roleModel.findById(id)

        if (!role) {
            throw new NotFoundException("Role Cannot be found")
        }

        return {
            success: true,
            message: "Role Fetched Success",
            result: role
        }
    }

    async CreateNewPermission(
        token: string,
        role_id: string,
        permission: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.email })
        const location = getLocationFromIP(ipAddress || "");

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const role = await this.roleModel.findById(role_id);

        if (!role) {
            throw new NotFoundException("Role not found");
        }

        if (role.permissions.includes(permission)) {
            throw new ConflictException("The Permission already added to this role");
        }

        await this.roleModel.updateOne(
            { _id: role_id },
            { $addToSet: { permissions: permission } }
        );

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "NEW_PERMISSION_ADDED",
            description: `${user.email} add new Permission ${permission} to ${role.role}`,
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
            message: "Permission Added to Role Success"
        }
    }

    async DeletePermission(
        token: string,
        role_id: string,
        permission: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const payload = await this.jwtService.verify(token)
        const user = await this.userModel.findOne({ email: payload.email })
        const location = getLocationFromIP(ipAddress || "");

        if (!user) {
            throw new NotFoundException("The User Not Found")
        }

        const role = await this.roleModel.findById(role_id);

        if (!role) {
            throw new NotFoundException("Role not found");
        }

        if (!role.permissions.includes(permission)) {
            throw new NotFoundException("Permission not found in this role");
        }

        await this.roleModel.updateOne(
            { _id: role_id },
            { $pull: { permissions: permission } }
        );

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "PERMISSION_DELETED",
            description: `${user.email} Delete Permission ${permission} from ${role.role}`,
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
            message: "Permission Delete from Role Success"
        }
    }

}