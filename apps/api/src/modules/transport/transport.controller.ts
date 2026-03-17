import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('Transport')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transport')
export class TransportController {
  @Get() findAll(@Req() req: any) { return { module: 'Transport' } }
  @Post() create(@Body() body: any) { return body }
  @Patch(':id') update(@Param('id') id: string, @Body() body: any) { return body }
  @Delete(':id') remove(@Param('id') id: string) { return { id } }
}
