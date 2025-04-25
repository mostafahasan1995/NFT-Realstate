import { Injectable } from '@nestjs/common';
import { Form } from './schemas/form.schema';
import { BaseRepository } from '../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FormRepository extends BaseRepository<Form> {
  constructor(
    @InjectModel(Form.name)
    private readonly formModel: Model<Form>
  ) {
    super(formModel);
  }
}
