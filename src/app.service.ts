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


  async getDashboardData() {
    const sites = await this.siteModel.find().exec();

    return await Promise.all(sites.map(async(site)=>{

      const checks = await this.checkModel
      .find({site_id: site._id})
      .sort({checked_at: -1})
      .limit(100)
      .exec();

      if (checks.length === 0) {
        return { ...site.toObject(), uptime: 0, status: 0, latencyData: [] };
      }

      const successfulChecks = checks.filter(c => c.status_code >= 200 && c.status_code < 300).length;
      
      const uptimePercentage = (successfulChecks / checks.length) * 100;

      return {
        id: site._id,
        name: site.name,
        url: site.url,
        status: checks[0]?.status_code || 0,
        uptime: parseFloat(uptimePercentage.toFixed(2)),
        latencyData: checks.slice(0, 10).map(check => ({
          time: new Date(check.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ms: check.response_time_ms
        })).reverse()

      }
    }))
  }
  
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
