import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';


const uri = "mongodb+srv://sebastiansosa3011:qM7CJBzL1gwLrHPB@prueba.ylwzz.mongodb.net/web-defender?appName=Prueba" 

@Module({
  imports: [
    MongooseModule.forRoot(uri)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
