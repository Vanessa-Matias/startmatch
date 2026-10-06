// conversations.controller.ts
// ==============================
// Chat entre startup e investidor depois do Match (a Conversa é criada junto
// com o Match, em matches.service.ts). Listagem, histórico de mensagens e
// envio — sem WebSocket, é tudo request/response comum.
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { TipoUsuario } from '../../common/enums';
import { ConversationsService } from './conversations.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @ApiOperation({ summary: 'Lista as conversas do usuário logado' })
  @Get()
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async findAll(
    @CurrentUser() user: RequestUser,
  ): Promise<ConversationResponseDto[]> {
    const conversas = await this.conversationsService.findAllForUser(user.id);
    return plainToInstance(ConversationResponseDto, conversas);
  }

  @ApiOperation({ summary: 'Lista as mensagens de uma conversa' })
  @Get(':id/messages')
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async findMessages(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: RequestUser,
  ): Promise<MessageResponseDto[]> {
    const mensagens = await this.conversationsService.findMessages(id, user.id);
    return plainToInstance(MessageResponseDto, mensagens);
  }

  @ApiOperation({ summary: 'Envia uma mensagem em uma conversa' })
  @Post(':id/messages')
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async postMessage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const mensagem = await this.conversationsService.postMessage(
      id,
      user.id,
      dto,
    );
    return plainToInstance(MessageResponseDto, mensagem);
  }
}
