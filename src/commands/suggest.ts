import {COLORS, createEmbed, getInteractionId, getRandomElement, getRemainingNames} from '../helper';
import {ChatInputCommandInteraction} from 'discord.js';
import {loadData} from '../persistence';

export const suggest = async (interaction: ChatInputCommandInteraction) => {
    const interactionId = getInteractionId(interaction)
    const data = loadData(interactionId);
    const remaining = getRemainingNames(data);

    if (remaining.length) {
        const suggestion = getRandomElement(remaining);
        return interaction.reply({
          embeds: [
              createEmbed({
                  color: COLORS.suggest,
                  title: `💡 Suggestion: **${suggestion}**`,
                  description: `
                    This name will **not** be crossed off. Use \`/spin\` to draw for real.\n\n
                    **${remaining.length}** name(s) still available.
                  `
              }),
          ],
        })
    }

    return interaction.reply({
      embeds: [
        createEmbed({
          color: COLORS.info,
          title: '🔄 All names have been drawn!',
          description: 'Use `/spin` to start a new round.'
        })
      ]
    });
  }
