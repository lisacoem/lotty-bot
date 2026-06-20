import { ChatInputCommandInteraction } from 'discord.js';
import { loadAllNames } from '../persistence';
import { COLORS, createEmbed, getInteractionId } from '../helper';

export const showNames = async (interaction: ChatInputCommandInteraction) => {
  const interactionId = getInteractionId(interaction);
  const allNames = loadAllNames(interactionId);

  if (!allNames.length) {
    return interaction.reply({
      embeds: [createEmbed({
        color: COLORS.warning,
        title: '📋 No names set',
        description: 'Use `/setnames` or `/addname` to add names.',
      })],
      flags: 'Ephemeral',
    });
  }

  const list = allNames
    .map((entry, index) => `${index + 1}. ${entry.isTimeout ? '⏸️ ~~' + entry.name + '~~' : entry.name}`)
    .join('\n');

  await interaction.reply({
    embeds: [createEmbed({
      color: COLORS.info,
      title: `📋 All names (${allNames.length})`,
      description: list,
    })],
  });
};
