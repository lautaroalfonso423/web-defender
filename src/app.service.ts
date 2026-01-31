import { Injectable } from '@nestjs/common';
import { Sites, SitesDocument } from './db/sites.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SitesDto } from './dto/sites.dto';

@Injectable()
export class AppService {

  constructor(
    @InjectModel(Sites.name) private siteModel: Model<SitesDocument>                                                                                                                                                                                                                                                                 
  ){}
  
  async getViewSites() {
    return await this.siteModel.find().exec();
  }

  async createSiteTest(props: SitesDto) {
    
    const newSite = await this.siteModel.create({
      ...props
    })

    return newSite;
  }

  
}
