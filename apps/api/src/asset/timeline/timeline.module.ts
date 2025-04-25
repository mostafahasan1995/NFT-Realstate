import { Module } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Timeline, TimelineSchema } from './schema/timeline.schema';
import { TimelineAdminController } from './timeline.admin.controller';
import { TimelineRepository } from './timeline.repository';
import { TimelineController } from './timeline.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Timeline.name,
        schema: TimelineSchema,
      }
    ]
    ),
  ],
  controllers: [TimelineAdminController, TimelineController],
  providers: [TimelineService, TimelineRepository]
})
export class TimelineModule { }

