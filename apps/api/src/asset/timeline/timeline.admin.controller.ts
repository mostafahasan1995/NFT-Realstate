import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { CreateTimelineDto } from './dto/create-timeline.dto';
import { CreateTimelineActionDto } from './dto/create-timeline-action.dto';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { DeleteActionDto } from './dto/delete-action.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryActionDto } from './dto/query-action.dto';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/timeline')
@Controller('admin/timeline')
export class TimelineAdminController {
  constructor(private readonly timelineService: TimelineService) { }

  @Post('')
  async createTimeline(@Body() createTimelineDto: CreateTimelineDto) {
    return this.timelineService.createTimeline(createTimelineDto);
  }

  @Get('')
  async findTimeline(@Query() queryTimelineDto: QueryTimelineDto) {
    return this.timelineService.findTimeline(queryTimelineDto);
  }

  @Delete(':timelineId')
  async deleteTimeline(@Param('timelineId') timelineId: string) {
    return this.timelineService.deleteTimeline(timelineId);
  }

  @Post('action')
  async createAction(@Body() createTimelineDto: CreateTimelineActionDto) {
    return this.timelineService.createAction(createTimelineDto);
  }

  @Put('action')
  async updateAction(@Body() createTimelineDto: UpdateActionDto) {
    return this.timelineService.updateAction(createTimelineDto);
  }

  @Get('action')
  async findAction(@Query() queryActionDto: QueryActionDto) {
    return this.timelineService.findAction(queryActionDto);
  }


  @Delete(':timelineId/action/:actionId')
  async deleteTimelineAction(@Param() deleteActionDto: DeleteActionDto) {
    return this.timelineService.deleteAction(deleteActionDto);
  }

}
