import {ChatInputCommandInteraction} from 'discord.js';
import {loadData, saveData} from '../persistence';
import {COLORS, createEmbed, findName, getRemainingNames} from '../helper';

export const pick = (interaction: ChatInputCommandInteraction) => {
    const data = loadData();
    const input = interaction.options.getString('name', true).trim();
    const remaining = getRemainingNames(data)
    const matchingName = findName(input, remaining);

    if (!matchingName) {
      const alreadyPicked = !!findName(input, data.history);
      if (alreadyPicked) {
        return interaction.reply({
            embeds: [
                createEmbed({
                    color: COLORS.error,
                    title: '❌ Already crossed off',
                    description: `**${alreadyPicked}** has already been drawn.`
                })
            ],
            flags: 'Ephemeral',
        });
      } else {
        return interaction.reply({
          embeds: [
              createEmbed({
                  color: COLORS.error,
                  title: '❌ Name not found',
                  description: `**${input}** is not in the list.\n\nAvailable: ${remaining.join(', ') || '—'}`
              })
          ],
          flags: 'Ephemeral',
        });
      }
    }

    data.history.push(matchingName);
    saveData(data);

    const totalRemaining = remaining.length - 1

    return interaction.reply({
      embeds: [
          createEmbed({
                color: COLORS.warning,
                title:  `✂️ Crossed off: **${matchingName}**`,
                description: totalRemaining
                    ? `**${totalRemaining}** name(s) remaining.`
                    : '🏁 That was the last name!',
                fields: [{ name: '📜 Already crossed off', value: data.history.join(', '), inline: true }],
          }),
      ],
    });
  }
