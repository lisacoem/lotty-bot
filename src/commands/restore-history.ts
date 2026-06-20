// restore-history.ts
import { ChatInputCommandInteraction } from 'discord.js';
import { restoreHistory } from '../persistence';
import { COLORS, createEmbed, getInteractionId } from '../helper';

export const restoreHistoryCommand = async (interaction: ChatInputCommandInteraction) => {
  const interactionId = getInteractionId(interaction);
  const input = interaction.options.getString('names', true);
  const names = input.split(',').map(n => n.trim()).filter(Boolean);

  if (names.length === 0) {
    return interaction.reply({
      embeds: [createEmbed({
        color: COLORS.error,
        title: '❌ Error',
        description: 'No valid names found.',
      })],
      flags: 'Ephemeral',
    });
  }

  restoreHistory(interactionId, names);

  return interaction.reply({
    embeds: [createEmbed({
      color: COLORS.info,
      title: '✅ History restored',
      description: `History has been replaced with **${names.length}** name(s).`,
      fields: [{
        name: '📜 Restored history', value: names.join(', '),
        inline: true
      }],
    })],
  });
};
