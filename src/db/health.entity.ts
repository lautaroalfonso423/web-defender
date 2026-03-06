import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Sites } from "./sites.entity";
import { SystemEnum } from "src/system.enum";


export type CheckDocument = HydratedDocument<Check>;

@Schema()

export class Check {

    @Prop({type: Types.ObjectId, ref: "Sites", required: true})
    site_id: Types.ObjectId;

    @Prop({required: true})
    status_code: number;

    @Prop()
    response_time_ms: number

    @Prop({type: Number})
    cpuUsage: number;

    @Prop({type: Number})
    ramUsage: number;

    @Prop({
        type: String,
        enum: SystemEnum,
        default: SystemEnum.HEALTHY
    })
    status: SystemEnum

    @Prop({default: Date.now})
    checked_at: Date;

    @Prop()
    error_message: string;

}

export const CheckSchema = SchemaFactory.createForClass(Check)