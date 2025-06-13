import { HttpException, HttpStatus } from '@nestjs/common';

export class MessageContentMissingException extends HttpException {
  constructor() {
    super('Le contenu du message est requis.', HttpStatus.BAD_REQUEST);
  }
}

export class MessageSenderMissingException extends HttpException {
  constructor() {
    super("L'identifiant de l'expéditeur est requis.", HttpStatus.BAD_REQUEST);
  }
}

export class MessageConversationMissingException extends HttpException {
  constructor() {
    super("L'identifiant de la conversation est requis.", HttpStatus.BAD_REQUEST);
  }
}

export class MessageNotFoundException extends HttpException {
  constructor(id: number) {
    super(`Aucun message trouvé avec l'identifiant ${id}.`, HttpStatus.NOT_FOUND);
  }
}
