import {ChatInputCommandInteraction} from "discord.js";
import {loadData} from "../persistence";
import {createEmbed, COLORS, getRemainingNames} from "../helper";

export const showRemaining = async (interaction: ChatInputCommandInteraction) => {
    const data = loadData();
    const remaining = getRemainingNames(data);

    if (remaining.length) {
      return interaction.reply({
        embeds: [
          createEmbed({
              color: COLORS.success,
              title: `📋 Remaining names (${remaining.length})`,
              description: remaining.map((name, index) => `${index + 1}. ${name}`).join('\n')
            })
          ],
        flags: 'Ephemeral',
      });
    }

    return interaction.reply({
      embeds: [
        createEmbed({
            color: COLORS.info,
            title: '📜 Remaining names',
            description: '🏁 All names have been drawn! Use `/roll` to start a new round.'
        })
      ],
      flags: 'Ephemeral',
    });
}
