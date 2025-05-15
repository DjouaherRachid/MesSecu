import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service'

@Controller('users')
export class UserController { 
    constructor(private readonly userService: UserService) {}    
    @Get()
    // localhost:3000/users/settings
    getUsers() {
        return this.userService.getUsers();
    }}
