import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StreamsService } from './streams.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guard/roles.guard';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiTags('streams')
@Controller('streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Get('applications')
  async getApplications(@Req() req: Request) {
    try {
      const data = await this.streamsService.handleApiRequest(
        req,
        'GET',
        '/applications'
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  @Post()
  create(@Body() createStreamDto: CreateStreamDto) {
    return this.streamsService.create(createStreamDto);
  }

  @Get()
  findAll() {
    return this.streamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.streamsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStreamDto: UpdateStreamDto) {
    return this.streamsService.update(+id, updateStreamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.streamsService.remove(+id);
  }
}
