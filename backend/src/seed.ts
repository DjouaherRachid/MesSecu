import { AppDataSource } from './data-source';
import { User } from './user/user.entity';
import { Conversation } from './conversation/conversation.entity';
import { ConversationParticipant } from './conversation/conversation-participant.entity';
import { Message } from './message/message.entity';
import { MessageRead } from './message/message-read.entity';
import { UserRole } from './conversation/conversation-participant.entity'; 

async function seed() {
  await AppDataSource.initialize();

  try {
    const userRepo = AppDataSource.getRepository(User);
    const convRepo = AppDataSource.getRepository(Conversation);
    const participantRepo = AppDataSource.getRepository(ConversationParticipant);
    const messageRepo = AppDataSource.getRepository(Message);
    const messageReadRepo = AppDataSource.getRepository(MessageRead);

    // Seed users
    // const alice = await userRepo.findOneBy({ username: 'alice' });
    // if (!alice) {
      const users = userRepo.create([
        {
          username: 'alice',
          email: 'alice@example.com',
          password_hash: '$2b$10$oPIIEIx2e1xsuAJugEuCLezKonnysaRWygGCJFZXER7iqh/TIIISe',
          public_key: 'alice_pub_key',
          private_key_encrypted: 'alice_priv_enc',
          avatar_url: 'https://example.com/avatar1.png',
        },
        {
          username: 'bob',
          email: 'bob@example.com',
          password_hash: 'hashed_pw2',
          public_key: 'bob_pub_key',
          private_key_encrypted: 'bob_priv_enc',
          avatar_url: 'https://example.com/avatar2.png',
        },
        {
          username: 'charlie',
          email: 'charlie@example.com',
          password_hash: 'hashed_pw3',
          public_key: 'charlie_pub_key',
          private_key_encrypted: 'charlie_priv_enc',
          avatar_url: 'https://example.com/avatar3.png',
        },
      ]);
      await userRepo.save(users);
      console.log('✅ Users seeded');
    // } else {
    //   console.log('⏩ Users already exist, skipping');
    // }

    // Seed conversations
    const convCount = await convRepo.count();
    if (convCount === 0) {
      const conv1 = convRepo.create({ name: 'Chat Alice & Bob' });
      const conv2 = convRepo.create({ name: 'Groupe entre tous' });
      await convRepo.save([conv1, conv2]);
      console.log('✅ Conversations seeded');

      const aliceReloaded = await userRepo.findOneByOrFail({ username: 'alice' });
      const bobReloaded = await userRepo.findOneByOrFail({ username: 'bob' });
      const charlieReloaded = await userRepo.findOneByOrFail({ username: 'charlie' });

  const participants = participantRepo.create([
    { conversation: conv1, user: aliceReloaded, role: UserRole.MEMBER },
    { conversation: conv1, user: bobReloaded, role: UserRole.MEMBER },
    { conversation: conv2, user: aliceReloaded, role: UserRole.ADMIN },
    { conversation: conv2, user: bobReloaded, role: UserRole.MEMBER },
    { conversation: conv2, user: charlieReloaded, role: UserRole.MEMBER },
  ]);

    await participantRepo.save(participants);

      console.log('✅ Participants seeded');

      const messages = messageRepo.create([
        { conversation: conv1, sender: aliceReloaded, content: 'Salut Bob, ça va ?', encrypted: true },
        { conversation: conv1, sender: bobReloaded, content: 'Salut Alice ! Oui ça va, et toi ?', encrypted: true },
        { conversation: conv2, sender: charlieReloaded, content: 'Salut tout le monde !', encrypted: true },
        { conversation: conv2, sender: aliceReloaded, content: 'Hey Charlie ! Bienvenue dans le groupe.', encrypted: true },
        { conversation: conv2, sender: bobReloaded, content: 'Yo les amis !', encrypted: true },
      ]);
      await messageRepo.save(messages);
      console.log('✅ Messages seeded');

      await messageReadRepo.save([
        { message: messages[0], user: bobReloaded },
        { message: messages[2], user: aliceReloaded },
        { message: messages[2], user: charlieReloaded },
      ]);
      console.log('✅ Message reads seeded');
    } else {
      console.log('⏩ Conversations already exist, skipping all related seeds');
    }

  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
