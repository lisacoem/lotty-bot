import {ChatInputCommandInteraction} from 'discord.js';
import {COLORS, createEmbed} from '../helper';

export const help = async (interaction: ChatInputCommandInteraction) => {
  return interaction.reply({
    embeds: [
      createEmbed({
        color: COLORS.info,
        title: '🎡 Lotty – Commands',
        description: [
          '`/spin` – pick a random name and cross it off',
          '`/suggest` – sneak a peek without crossing anyone off',
          '`/pick [name]` – manually cross off a name',
          '`/revert [name]` – undo crossing off a name',
          '`/history` – see who\'s already been picked',
          '`/remaining` – see who\'s still in the pool',
          '`/names` – see everyone, including who\'s in timeout',
          '`/reset` – put everyone back in the pool',
          '`/setnames [names]` – set a new name list',
          '`/add [name]` – add a name to the list',
          '`/remove [name]` – remove a name from the list',
          '`/timeout [name]` – exclude a name from spin/suggest',
          '`/reactivate [name]` – bring a name back from timeout',
          '`/restorehistory [names]` – manually restore history',
        ].join('\n'),
      }),
    ],
    flags: 'Ephemeral',
  });
};
