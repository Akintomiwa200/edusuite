import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('AuditLog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditLogController {
  @Get() findAll(@Req() req: any) { return { module: 'AuditLog' } }
  @Post() create(@Body() body: any) { return body }
  @Patch(':id') update(@Param('id') id: string, @Body() body: any) { return body }
  @Delete(':id') remove(@Param('id') id: string) { return { id } }
}
