import { filterLogLevels, Injectable, Logger } from '@nestjs/common';
import { Sites, SitesDocument } from './db/sites.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SitesDto } from './dto/sites.dto';
import axios from 'axios';
import { Check, CheckDocument } from './db/health.entity';

@Injectable()
export class AppService {
  

  constructor(
    @InjectModel(Sites.name) private siteModel: Model<SitesDocument>,
    @InjectModel(Check.name) private checkModel: Model<CheckDocument>                                                                                                                                                                                                                                                                   
  ){}
  private readonly logger = new Logger(AppService.name)
  
  async getViewSites() {
    return await this.siteModel.find().exec();
  }

  async createSiteTest(props: SitesDto) {
    
    const newSite = await this.siteModel.create({
      ...props
    })

    return newSite;
  }

  async test() {
    
    const FilterSites = await this.siteModel.find({
      is_active: true,
    }).exec()

    for(const data of FilterSites){
      const startTime = performance.now()
      let statusCode: number = 0;
      let errorMessage: string | null = null;

      try {
        const response = await axios.get(data.url, {timeout: 5000})
        statusCode = response.status
      } catch (error) {
        if(error.response){
          statusCode = error.response.status
        
        } else {
          statusCode = 0;
          errorMessage = error.message
        }
        
      } finally {
        const TimeResponse = performance.now() - startTime;

        await this.checkModel.create({
          site_id: data._id,
          status_code: statusCode,
          response_time_ms: TimeResponse,
          checked_at: new Date(),
          error_message: errorMessage || "",

        })
        
        this.logger.log(`Chequeo finalizado para ${data.name}: Status ${statusCode} (${TimeResponse}ms)`)

      }
    }
    
   
  
  }

  
}
