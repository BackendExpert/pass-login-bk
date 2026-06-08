import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RoleDocument = Role & Document

@Schema({ timestamps: true })

export class Role {
    @Prop({ unique: true, required: true, enum: ['super_admin', 'admin', 'staff', 'user'] })
    role!: string

    @Prop({ type: [String], default: [] })
    permissions!: string[]
}

export const RoleSchema = SchemaFactory.createForClass(Role);