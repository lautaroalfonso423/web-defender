import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Sites, SitesSchema } from './db/sites.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
   
  ConfigModule.forRoot({
    isGlobal:true
  }),
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService)=>({
      uri: configService.get<string>("URI_DATABASE")
    })
  }),

    MongooseModule.forFeature([{name: Sites.name, schema: SitesSchema}])
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
