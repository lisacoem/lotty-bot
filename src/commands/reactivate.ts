import { ChatInputCommandInteraction } from 'discord.js';
import { removeFromTimeout } from '../persistence';
import { COLORS, createEmbed, getInteractionId } from '../helper';

export const reactivate = async (interaction: ChatInputCommandInteraction) => {
  const interactionId = getInteractionId(interaction);
  const name = interaction.options.getString('name', true).trim();

  try {
    removeFromTimeout(interactionId, name);
    await interaction.reply({
      embeds: [createEmbed({
        color: COLORS.info,
        title: `${name} is back in the game`,
        description: `${name} is eligible for \`/spin\` and \`/suggest\` again.`,
      })],
    });
  } catch {
    await interaction.reply({
      embeds: [createEmbed({
        color: COLORS.error,
        title: '❌ Name not found',
        description: `**${name}** is not in the list.`,
      })],
    });
  }
};
