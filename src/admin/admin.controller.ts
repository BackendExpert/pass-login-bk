import { Body, Controller, Get, Headers, Param, Patch, Post, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { PermissionsGuard } from "src/common/guard/permissions.guard";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";



@Controller('api/admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Patch('/update-account-status/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:update-account-status')

    UpdateUserAccountStuts(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string,
        @Body('status') status: boolean,
        @ClientInfoDecorator() client: ClientInfo,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.ActivateDeActiveUser(
            token,
            id,
            status,
            client?.ipAddress,
            client?.userAgent
        )
    }

    @Get('/fetch-users')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:fetch-all-users')

    FetchAllUsers(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.FetchAllusers(token)
    }


    @Get('/fetch-users/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:fetch-user-by-id')

    FetchUserById(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.fetchUserbyId(
            token,
            id
        )
    }

    @Post('/create-role')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:fetch-user-by-id')

    CreateNewRole(
        @Headers("authorization") authHeader: string,
        @Body('role') role: string,
        @ClientInfoDecorator() client: ClientInfo,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.CreteNewRole(
            token,
            role,
            client?.ipAddress,
            client?.userAgent
        )
    }


    @Get('/fetch-roles')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:fetch-roles')

    FetchRoles(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.FetchAllRoles(
            token
        )
    }

    @Get('/fetch-role/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:fetch-role-by-id')

    FetchRoleByID(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.FetchRoleById(
            token,
            id
        )
    }

    @Patch('/create-permission/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:create-permission')

    CreatePermission(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string,
        @Body('permission') permission: string,
        @ClientInfoDecorator() client: ClientInfo,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.CreateNewPermission(
            token,
            id,
            permission,
            client?.ipAddress,
            client?.userAgent
        )
    }

    @Patch('/delete-permission/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:delete-permission')

    DeletePermission(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string,
        @Body('permission') permission: string,
        @ClientInfoDecorator() client: ClientInfo,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.DeletePermission(
            token,
            id,
            permission,
            client?.ipAddress,
            client?.userAgent
        )
    }
}