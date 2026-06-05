import {ChatInputCommandInteraction} from "discord.js";
import {loadData, saveData} from "../persistence";
import {createEmbed, COLORS} from "../helper";

export const reset = (interaction: ChatInputCommandInteraction) => {
    const data = loadData();
    const oldHistory = [...data.history];
    data.history = [];
    saveData(data);

    return interaction.reply({
        embeds: [
            createEmbed({
                color: COLORS.success,
                title: '🔄 Reset',
                description: `All **${data.names.length}** name(s) are available again.`,
                fields: oldHistory.length
                    ? [{ name: '🗑️ Cleared history', value: oldHistory.join(', '), inline: true }]
                    : [],
            }),
        ]
    });
  }
