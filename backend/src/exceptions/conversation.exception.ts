import { HttpException, HttpStatus } from '@nestjs/common';

export class ConversationNotFoundException extends HttpException {
  constructor(id: number) {
    super(`Conversation avec l’ID ${id} introuvable.`, HttpStatus.NOT_FOUND);
  }
}

export class UserOrConversationIdMissingException extends HttpException {
  constructor() {
    super('L’ID de l’utilisateur et de la conversation sont requis.', HttpStatus.BAD_REQUEST);
  }
}