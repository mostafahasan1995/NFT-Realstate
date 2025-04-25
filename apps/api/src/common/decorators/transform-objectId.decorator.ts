import { Transform } from 'class-transformer';

export const TransformObjectId = () => {
  return Transform(({ value }) => value.toString());
};
