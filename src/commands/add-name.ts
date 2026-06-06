import {COLORS, createEmbed, findName, getInteractionId, getRemainingNames} from '../helper';
import {ChatInputCommandInteraction} from 'discord.js';
import {loadData, saveData} from '../persistence';

export const addName = async (interaction: ChatInputCommandInteraction) => {
    const input = interaction.options.getString('name', true);
    const interactionId = getInteractionId(interaction)
    const data = loadData(interactionId);

    const matchingName = findName(input, data.names);

    if (matchingName) {
        return interaction.reply({
            embeds: [
                createEmbed({
                    color: COLORS.error,
                    title: '❌ Already exists',
                    description: `**${matchingName}** is already in the list.`
                })
            ],
            flags: 'Ephemeral',
        });
    }

    const name = input.trim();

    data.names.push(name);
    saveData(interactionId, data);

    const remaining = getRemainingNames(data);

    return interaction.reply({
        embeds: [createEmbed({
            color: COLORS.success,
            title: `➕ Added: **${name}**`,
            description: `The list now has **${data.names.length}** name(s). **${remaining.length}** still available to draw.`
        })],
    });
};
