import {ChatInputCommandInteraction} from "discord.js";
import {saveData} from "../persistence";
import {createEmbed, COLORS} from "../helper";

export const setNames = async (interaction: ChatInputCommandInteraction) => {
    const input = interaction.options.getString('names', true);
    const names = input.split(',').map(n => n.trim()).filter(Boolean);

    if (!names.length) {
        return interaction.reply({
            embeds: [createEmbed({
                color: COLORS.error,
                title: '❌ Error',
                description: 'No valid names found.'
            })],
            flags: 'Ephemeral',
        });
    }

    saveData({ names, history: [] });

    const formattedNameList = names
        .map((name, index) => `${index + 1}. ${name}`)
        .join('\n')

    return interaction.reply({
        embeds: [
            createEmbed({
                color: COLORS.success,
                title: '✅ Names set',
                description: `**${names.length} name(s)** have been set and the history has been cleared.`,
                fields: [{name: '📋 Names', value: formattedNameList, inline: false }],
            })
        ],
    });
};
