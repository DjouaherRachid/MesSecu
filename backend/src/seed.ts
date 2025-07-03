import { AppDataSource } from './data-source';
import { User } from './user/user.entity';
import { Conversation } from './conversation/conversation.entity';
import { ConversationParticipant } from './conversation/conversation-participant.entity';
import { Message } from './message/message.entity';
import { MessageRead } from './message/message-read.entity';
import { UserRole } from './conversation/conversation-participant.entity'; 
import { IdentityKey } from './keys/identity-key/identity-key.entity';
import { SignedPreKey } from './keys/signed-pre-key/signed-pre-key.entity';
import { OneTimePreKey } from './keys/one-time-pre-key/one-time-pre-key.entity';

async function seed() {
  await AppDataSource.initialize();

  try {
    const userRepo = AppDataSource.getRepository(User);
    const convRepo = AppDataSource.getRepository(Conversation);
    const participantRepo = AppDataSource.getRepository(ConversationParticipant);
    const messageRepo = AppDataSource.getRepository(Message);
    const messageReadRepo = AppDataSource.getRepository(MessageRead);
    const oneTimePreKeyRepo = AppDataSource.getRepository(OneTimePreKey); 
    const identityKeyRepo = AppDataSource.getRepository(IdentityKey);
    const signedPreKeyRepo = AppDataSource.getRepository(SignedPreKey);

    const users = userRepo.create([
    {
      username: 'alice',
      email: 'alice@example.com',
      password_hash: '$2b$10$oPIIEIx2e1xsuAJugEuCLezKonnysaRWygGCJFZXER7iqh/TIIISe',
      avatar_url: 'https://example.com/avatar1.png',
    },
    {
      username: 'bob',
      email: 'bob@example.com',
      password_hash: 'hashed_pw2',
      avatar_url: 'https://example.com/avatar2.png',
    },
    {
      username: 'charlie',
      email: 'charlie@example.com',
      password_hash: 'hashed_pw3',
      avatar_url: 'https://example.com/avatar3.png',
    },
    ]);
      await userRepo.save(users);
      console.log('✅ Users seeded');

  // Identity Keys (pas de key_id, OneToOne avec User)
  const identityKeys = identityKeyRepo.create([
    {
      user: users[0],
      public_key: 'alice-identity-public-key',
    },
    {
      user: users[1],
      public_key: 'bob-identity-public-key',
    },
    {
      user: users[2],
      public_key: 'charlie-identity-public-key',
    },
  ]);
  await identityKeyRepo.save(identityKeys);
  console.log('✅ Identity keys seeded');


  // Signed Pre-Keys (ManyToOne, avec key_id, public_key, signature)
  const signedPreKeys = signedPreKeyRepo.create([
    {
      user: users[0],
      key_id: 1,
      public_key: 'alice-signed-pre-key-public-key',
      signature: 'alice-signature',
    },
    {
      user: users[1],
      key_id: 2,
      public_key: 'bob-signed-pre-key-public-key',
      signature: 'bob-signature',
    },
    {
      user: users[2],
      key_id: 3,
      public_key: 'charlie-signed-pre-key-public-key',
      signature: 'charlie-signature',
    },
  ]);
  await signedPreKeyRepo.save(signedPreKeys);
  console.log('✅ Signed pre-keys seeded');


  // One-Time Pre-Keys (ManyToOne, avec key_id, public_key, used)
  const oneTimePreKeys = oneTimePreKeyRepo.create([
    {
      user: users[0],
      key_id: 101,
      public_key: 'alice-one-time-pre-key-public-key-1',
      used: false,
    },
    {
      user: users[1],
      key_id: 102,
      public_key: 'bob-one-time-pre-key-public-key-1',
      used: false,
    },
    {
      user: users[2],
      key_id: 103,
      public_key: 'charlie-one-time-pre-key-public-key-1',
      used: false,
    },
  ]);
  await oneTimePreKeyRepo.save(oneTimePreKeys);
  console.log('✅ One-time pre-keys seeded');

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
 