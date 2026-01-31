import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SitesDto } from './dto/sites.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller("sites")
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}
 
  
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

  @Cron("45 * * * * * ")
  async handleTestSite() {
    return this.appService.test()
  }



}
