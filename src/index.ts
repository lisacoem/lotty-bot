import {
  Client,
  GatewayIntentBits, InteractionReplyOptions,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import 'dotenv/config';
import {setNames, addName, removeName, spin, reset, suggest, pick, showRemaining, showHistory} from './commands';
import {COLORS, createEmbed, getInteractionId} from './helper';
import {loadData} from './persistence';

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;

const commands = [
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
];

const interactionHandlers = {
  setnames: setNames,
  spin: spin,
  suggest: suggest,
  pick: pick,
  history: showHistory,
  remaining: showRemaining,
  reset: reset,
  add: addName,
  remove: removeName,
};

async function registerCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  console.log(`📡 Lotty: Registering slash commands...`);
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log(`✅ Lotty: Commands registered.`);
}


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', () => {
  console.log(`🤖 Lotty is online as ${client.user?.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const interactionId = getInteractionId(interaction)
  const data = await loadData(interactionId);

  if (interaction.commandName !== 'setnames' && interaction.commandName !== 'add' && data.names.length === 0) {
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
