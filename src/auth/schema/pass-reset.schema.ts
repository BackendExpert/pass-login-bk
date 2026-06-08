import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PassRestDocument = PassRest & Document

@Schema({ timestamps: true })

export class PassRest {
    @Prop({ unique: true, required: true })
    email!: string

    @Prop({ unique: true, required: true })
    token!: string

    @Prop({ required: true, expires: 0 })
    expireAt!: Date;
}

export const PassRestSchema = SchemaFactory.createForClass(PassRest);