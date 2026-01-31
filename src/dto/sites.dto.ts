import { IsBoolean, IsNumber, IsString } from "class-validator";



export class SitesDto {
    
    @IsString()
    url: string;
    
    @IsString()
    name: string;
    
    @IsNumber()
    frequency: number
    
    @IsBoolean()
    is_active: boolean;
}