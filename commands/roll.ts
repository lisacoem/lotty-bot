import {ChatInputCommandInteraction} from 'discord.js';
import {loadData, saveData} from '../persistence';
import {COLORS, createEmbed, getRandomElement, getRemainingNames} from '../helper';

export const roll = async (interaction: ChatInputCommandInteraction) => {
    const data = loadData();
    let remaining = getRemainingNames(data);

    if (!remaining.length) {
        saveData({...data, history: []})
        await interaction.reply({
            embeds: [createEmbed({
                color: COLORS.info,
                title: '🔄 All names have been drawn!',
                description: 'The list has been reset. Starting a new round...',
            })],
        });

        const pick = getRandomElement(data.names);
        data.history.push(pick);
        saveData(data);

        return interaction.followUp({
            embeds: [
                createEmbed({
                    color: COLORS.pick,
                    title: `🎲 Picked: **${pick}**`,
                    description: `**${data.names.length - data.history.length}** name(s) remaining.`,
                    fields: [{ name: '📜 Already drawn', value: data.history.join(', '), inline: true }],
                })
            ],
        });
    }

    const pick = getRandomElement(data.names);
    data.history.push(pick);
    saveData(data);

    const totalRemaining = remaining.length - 1

    await interaction.reply({
      embeds: [
        createEmbed({
            color: COLORS.pick,
            title: `🎲 Picked: **${pick}**`,
            description: !totalRemaining
              ? '🏁 That was the last name! The next `/roll` will start a new round.'
              : `**${totalRemaining}** name(s) remaining.`,
            fields: [{ name: '📜 Already drawn', value: data.history.join(', '), inline: true }],
        })
      ],
    });
}
