import {ChatInputCommandInteraction} from "discord.js";
import {loadData, saveData} from "../persistence";
import {createEmbed, COLORS, getInteractionId} from "../helper";

export const reset = async (interaction: ChatInputCommandInteraction) => {
    const interactionId = getInteractionId(interaction)
    const data = loadData(interactionId);
    const oldHistory = [...data.history];
  
    data.history = [];
    saveData(interactionId, data);

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
