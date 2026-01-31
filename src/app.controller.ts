import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { retry } from 'rxjs';
import { SitesDto } from './dto/sites.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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


}
