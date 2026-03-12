import { filterLogLevels, Injectable, Logger } from '@nestjs/common';
import { Sites, SitesDocument } from './db/sites.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SitesDto } from './dto/sites.dto';
import axios from 'axios';
import { Check, CheckDocument } from './db/health.entity';
import * as os from "os"
import { SystemEnum } from './system.enum';
import { cpuUsage } from 'process';
import { EventsGateway } from './events.gateway';

@Injectable()
export class AppService {
 
  

  constructor(
    private readonly eventGateway: EventsGateway,                                                                                                                                                                                                                                               
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

        const totalMem = os.totalmem();
        const freeMem = os.freemem()  
        const usedMem = ((totalMem - freeMem) / totalMem) * 100;

        let currentStatus = SystemEnum.HEALTHY
        if(usedMem > 80) currentStatus = SystemEnum.WARNING 
        if(usedMem > 90) currentStatus = SystemEnum.CRITICAL

        const [load1, load5, load15] = os.loadavg();



        this.eventGateway.sendUpdate({
          name: data.name,
          status_code: statusCode,
          status: currentStatus,
          ram: usedMem,
          cpu: load1.toFixed(2)
        })

        await this.checkModel.create({
          site_id: data._id,
          status_code: statusCode,
          response_time_ms: TimeResponse,
          ramUsage: usedMem,
          status: currentStatus,
          cpuUsage: Number(load1.toFixed(2) || load5.toFixed(2) || load15.toFixed(2)),
          checked_at: new Date(),
          error_message: errorMessage || "",
        })
        
       
        
        this.logger.log(`Chequeo finalizado para ${data.name}: Status ${statusCode} (${TimeResponse}ms) Uso de RAM ${usedMem} : Uso de CPU ${load1 || load5 || load15}`)

      }
    }
    
   
  
  }

  
}
