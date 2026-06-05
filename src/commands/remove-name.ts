import {ChatInputCommandInteraction} from 'discord.js';
import {loadData, saveData} from '../persistence';
import {COLORS, createEmbed, findName, getRemainingNames} from '../helper';

export const removeName = async (interaction: ChatInputCommandInteraction) => {
    const input = interaction.options.getString('name', true)
    const data = loadData();

    const matchingName = findName(input, data.names);

    if (!matchingName) {
        const currentNames = data.names.join(', ') ?? '—';

        return interaction.reply({
            embeds: [
                createEmbed({
                    color: COLORS.error,
                    title: '❌ Name not found',
                    description: `**${input}** is not in the list.\n\nCurrent names: ${currentNames}`
                })
            ],
            flags: 'Ephemeral',
        })
    }

    data.names = data.names.filter((name) => name !== matchingName);
    data.history = data.history.filter((name) => name !== matchingName);
    saveData(data);

    const remaining = getRemainingNames(data);

    const descriptionEmptyList = 'The list is now empty. Use `/setnames` or `/addname` to add names.'
    const descriptionDefault = `The list now has **${data.names.length}** name(s). **${remaining.length}** still available to draw.`

    return interaction.reply({
        embeds: [
            createEmbed({
                color: COLORS.warning,
                title: `🗑️ Removed: **${matchingName}**`,
                description: !!data.names.length
                    ? descriptionDefault
                    : descriptionEmptyList
            })
        ]
    })
};
