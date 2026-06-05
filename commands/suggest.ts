import {COLORS, createEmbed, getRandomElement, getRemainingNames} from '../helper';
import {ChatInputCommandInteraction} from 'discord.js';
import {loadData} from '../persistence';

export const suggest = (interaction: ChatInputCommandInteraction) => {
    const data = loadData();
    const remaining = getRemainingNames(data);

    if (remaining.length) {
        const suggestion = getRandomElement(remaining);
        return interaction.reply({
          embeds: [
              createEmbed({
                  color: COLORS.suggest,
                  title: `💡 Suggestion: **${suggestion}**`,
                  description: `
                    This name will **not** be crossed off. Use \`/roll\` to draw for real.\n\n
                    **${remaining.length}** name(s) still available.
                  `
              }),
          ],
          flags: 'Ephemeral',
        })
    }

    return interaction.reply({
      embeds: [
        createEmbed({
          color: COLORS.info,
          title: '🔄 All names have been drawn!',
          description: 'Use `/roll` to start a new round.'
        })
      ]
    });
  }
