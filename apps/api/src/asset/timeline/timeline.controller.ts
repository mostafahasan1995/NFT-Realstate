import { Controller, Get, Query } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { QueryTimelineDto } from './dto/query-timeline.dto';


@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) { }

  @Get('')
  async findTimeline(@Query() queryTimelineDto: QueryTimelineDto) {
    return this.timelineService.findTimeline(queryTimelineDto);
  }

}
