import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type SitesDocument = HydratedDocument<Sites>;

@Schema({timestamps: true})

export class Sites {

    @Prop({required: true, trim: true})
    url: string;

    @Prop({required: true, trim: true})
    name: string;

    @Prop({required: true, default: 5})
    frequency: number

    @Prop({default: true})
    is_active: boolean;

}

export const SitesSchema = SchemaFactory.createForClass(Sites)