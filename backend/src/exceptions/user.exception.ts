import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

export class UsernameMissingException extends BadRequestException {
  constructor() {
    super('Le nom d’utilisateur est requis.');
  }
}

export class EmailMissingException extends BadRequestException {
  constructor() {
    super('L’adresse email est requise.');
  }
}

export class UsernameAlreadyExistsException extends ConflictException {
  constructor() {
    super('Ce nom d’utilisateur existe déjà.');
  }
}

export class EmailAlreadyExistsException extends ConflictException {
  constructor() {
    super('Cette adresse email existe déjà.');
  }
}

export class UserNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Aucun utilisateur trouvé avec l’ID ${id}.`);
  }
}
