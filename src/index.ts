import {
  Client,
  GatewayIntentBits,
  InteractionReplyOptions,
  REST,
  Routes,
  SlashCommandBuilder, TextChannel,
} from 'discord.js';
import 'dotenv/config';
import {
  setNames,
  addName,
  removeName,
  spin,
  reset,
  suggest,
  pick,
  showRemaining,
  showHistory,
  restoreHistoryCommand,
  timeout,
  reactivate,
  showNames,
  revert
} from './commands';
import {COLORS, createEmbed, getInteractionId, getRandomElement} from './helper';
import {loadData} from './persistence';
import {help} from './commands/help';
import {greetings} from './greetings';

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;
const SPECIAL_ROLE_ID = process.env.SPECIAL_ROLE_ID;

const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('setnames')
    .setDescription('Set the list of names (comma-separated)')
    .addStringOption(opt =>
        opt.setName('names')
            .setDescription('e.g. Alice, Bob, Charlie')
            .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a new name to the list')
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('The name to add')
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Permanently remove a name from the list')
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('The name to remove')
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('history')
    .setDescription('Show all names that have already been drawn')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('remaining')
    .setDescription('Show all remaining names')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('spin')
    .setDescription('Randomly pick a name and cross it off')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Show a random suggestion without crossing it off')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('pick')
    .setDescription('Manually cross off a specific name')
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('The name to cross off')
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset the draw (all names become available again)')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Send a name into timeout — excluded from /spin and /suggest')
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('The name to send into timeout')
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('reactivate')
    .setDescription('Bring a name back from timeout')
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('The name to reactivate')
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('restorehistory')
    .setDescription('Manually restore history from a comma-separated list of names')
    .addStringOption(opt =>
      opt.setName('names')
        .setDescription('e.g. Alice, Bob, Charlie')
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('names')
    .setDescription('Show all names, including who is in timeout')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('revert')
    .setDescription('Undo crossing off a name — makes it available again')
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('The name to bring back')
        .setRequired(true)
    )
    .toJSON(),
];

const interactionHandlers = {
  help: help,
  setnames: setNames,
  spin: spin,
  suggest: suggest,
  pick: pick,
  history: showHistory,
  remaining: showRemaining,
  reset: reset,
  add: addName,
  remove: removeName,
  timeout: timeout,
  reactivate: reactivate,
  restorehistory: restoreHistoryCommand,
  names: showNames,
  revert: revert,
};

async function registerCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  console.log(`📡 Lotty: Registering slash commands...`);
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log(`✅ Lotty: Commands registered.`);
}


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

client.once('clientReady', () => {
  console.log(`🤖 Lotty is online as ${client.user?.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const interactionId = getInteractionId(interaction)
  const data = loadData(interactionId);

  const NO_NAMES_REQUIRED_COMMANDS = ['setnames', 'add', 'restorehistory', 'help']

  if (!NO_NAMES_REQUIRED_COMMANDS.includes(interaction.commandName) && !data.names.length) {
    return interaction.reply({
      embeds: [
        createEmbed({
          color: COLORS.warning,
          title: '⚠️ No names set',
          description: 'Please use `/setnames` first to set up the name list.'
        })
      ],
      flags: 'Ephemeral',
    });
  }

  const handler = interactionHandlers[interaction.commandName as keyof typeof interactionHandlers];

  if (handler) {
    try {
      await handler(interaction);

      if (SPECIAL_ROLE_ID && greetings.length) {
        const member = interaction.member;
        const hasRole = member?.roles instanceof Array
          ? member.roles.includes(SPECIAL_ROLE_ID)
          : member?.roles.cache.has(SPECIAL_ROLE_ID);

        if (hasRole) {
          await interaction.followUp({
            content: getRandomElement(greetings),
          });
        }
      }
    } catch (err) {
      console.error(`❌ Error in /${interaction.commandName}:`, err);

      const reply: InteractionReplyOptions = {
        embeds: [createEmbed({ color: COLORS.error, title: '❌ Error', description: 'An unexpected error occurred.' })],
        flags: 'Ephemeral',
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  }
});

(async () => {
  if (!TOKEN) throw new Error('DISCORD_TOKEN is not set!');
  if (!CLIENT_ID) throw new Error('CLIENT_ID is not set!');
  await registerCommands();
  await client.login(TOKEN);
})();
