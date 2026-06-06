import {ChatInputCommandInteraction} from 'discord.js';
import {loadData, saveData} from '../persistence';
import {COLORS, createEmbed, getInteractionId, getRandomElement, getRemainingNames} from '../helper';

export const spin = async (interaction: ChatInputCommandInteraction) => {
    const interactionId = getInteractionId(interaction)
    const data = await loadData(interactionId);
    let remaining = getRemainingNames(data);

    if (!remaining.length) {
      const pick = getRandomElement(data.names);
      saveData(interactionId, { names: data.names, history: [pick] });

      await interaction.reply({
        embeds: [createEmbed({
          color: COLORS.info,
          title: '🔄 All names have been drawn!',
          description: 'The list has been reset. Starting a new round...',
        })],
      });

      return interaction.followUp({
        embeds: [createEmbed({
          color: COLORS.pick,
          title: `🎲 Picked: **${pick}**`,
          description: `**${data.names.length - 1}** name(s) remaining.`,
          fields: [{ name: '📜 Already drawn', value: pick, inline: true }],
        })],
      });
    }

    const pick = getRandomElement(remaining);
    data.history.push(pick);
    saveData(interactionId, data);

    const totalRemaining = remaining.length - 1

    await interaction.reply({
      embeds: [
        createEmbed({
            color: COLORS.pick,
            title: `🎲 Picked: **${pick}**`,
            description: !totalRemaining
              ? '🏁 That was the last name! The next `/spin` will start a new round.'
              : `**${totalRemaining}** name(s) remaining.`,
            fields: [{ name: '📜 Already drawn', value: data.history.join(', '), inline: true }],
        })
      ],
    });
}
