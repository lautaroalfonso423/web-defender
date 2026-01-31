import { Body, Controller, Get, Logger, Post, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { SitesDto } from './dto/sites.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller("sites")
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}
 
  @Get("render")
  async renderSites(){
   return this.appService.getDashboardData()
  }
  
  @Get()
  
  async getSites(){
    return await this.appService.getViewSites();
  }

  @Post()
  async createSite(
    @Body() props: SitesDto
  ){
    return await this.appService.createSiteTest(props)
  } 

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleTestSite() {
    return this.appService.test()
  }



}
