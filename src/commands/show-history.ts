import {ChatInputCommandInteraction} from "discord.js";
import {loadData} from "../persistence";
import {createEmbed, COLORS, getInteractionId} from "../helper";

export const showHistory = async (interaction: ChatInputCommandInteraction) => {
    const interactionId = getInteractionId(interaction)
    const data = await loadData(interactionId);

    if (data.history.length) {
      return interaction.reply({
        embeds: [
          createEmbed({
              color: COLORS.history,
              title: `📜 History (${data.history.length}/${data.names.length})`,
              description: data.history.map((name, index) => `${index + 1}. ~~${name}~~`).join('\n')
            })
          ],
        flags: 'Ephemeral',
      });
    }

    return interaction.reply({
      embeds: [
        createEmbed({
            color: COLORS.history,
            title: '📜 History',
            description: 'No names have been drawn yet.'
        })
      ],
      flags: 'Ephemeral',
    });
};
