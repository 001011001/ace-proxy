import { Controller, Get, Post, Put, Delete, Param, Body, Logger, UseGuards } from '@nestjs/common';
import { StationAdminService } from './StationAdminService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/stations')
@UseGuards(JwtAuthGuard)
export class StationAdminController {
  private readonly logger = new Logger(StationAdminController.name);

  constructor(private readonly admin: StationAdminService) {}

  @Get()
  async list() {
    return this.admin.list();
  }

  @Get('stats')
  async stats() {
    return this.admin.getStationStats();
  }

  @Get(':code')
  async getByCode(@Param('code') code: string) {
    return this.admin.getByCode(code);
  }

  @Post()
  async create(@Body() body: any) {
    return this.admin.create(body);
  }

  @Put(':code')
  async update(@Param('code') code: string, @Body() body: any) {
    return this.admin.update(code, body);
  }

  @Delete(':code')
  async deactivate(@Param('code') code: string) {
    return this.admin.deactivate(code);
  }
}
