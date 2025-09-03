import { Module } from '@nestjs/common';
import { FilesController } from '../routes/files.controller';

@Module({
  controllers: [FilesController],
})
export class FilesModule {}