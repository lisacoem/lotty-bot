
import { ChatInputCommandInteraction } from 'discord.js';
import { sendToTimeout } from '../persistence';
import {COLORS, createEmbed, getInteractionId} from '../helper';

export const timeout = async (interaction: ChatInputCommandInteraction) => {
  const interactionId = getInteractionId(interaction);
  const name = interaction.options.getString('name', true).trim();

  try {
    sendToTimeout(interactionId, name);
    await interaction.reply({
      embeds: [createEmbed({
        color: COLORS.info,
        title: `⏸️ ${name} is now in timeout`,
        description: `${name} will be excluded from \`/spin\` and \`/suggest\` until reactivated.`
      })],
    })
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
