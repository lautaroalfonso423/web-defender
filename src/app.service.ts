import { Injectable } from '@nestjs/common';
import { Sites, SitesDocument } from './db/sites.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AppService {
  
  constructor(
    @InjectModel(Sites.name) private siteModel: Model<SitesDocument>                                                                                                                                                                                                                                                                 
  ){}
  
  async getViewSites() {
    return await this.siteModel.find().exec();
  }

}
