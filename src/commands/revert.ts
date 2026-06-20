import {ChatInputCommandInteraction} from 'discord.js';
import {loadData, saveData} from '../persistence';
import {COLORS, createEmbed, findName, getInteractionId, getRemainingNames} from '../helper';

export const revert = async (interaction: ChatInputCommandInteraction) => {
    const interactionId = getInteractionId(interaction)
    const data = loadData(interactionId);
    const input = interaction.options.getString('name', true).trim();

    const matchingName = findName(input, data.history);

    if (!matchingName) {
      const remaining = getRemainingNames(data);
      const alreadyAvailable = findName(input, remaining);

      return interaction.reply({
          embeds: [
              createEmbed({
                  color: COLORS.error,
                  title: alreadyAvailable ? '❌ Not crossed off' : '❌ Name not found',
                  description: alreadyAvailable
                      ? `**${alreadyAvailable}** hasn't been drawn yet.`
                      : `**${input}** is not in the list.\n\nAlready drawn: ${data.history.join(', ') || '—'}`
              })
          ],
          flags: 'Ephemeral',
      });
    }

    data.history = data.history.filter((name) => name !== matchingName);
    saveData(interactionId, data);

    const remaining = getRemainingNames(data);

    return interaction.reply({
      embeds: [
          createEmbed({
                color: COLORS.success,
                title: `Reverted: **${matchingName}**`,
                description: `**${matchingName}** is available again. **${remaining.length}** name(s) remaining.`,
                fields: data.history.length
                    ? [{ name: '📜 Already crossed off', value: data.history.join(', '), inline: true }]
                    : [],
          }),
      ],
    });
  }
