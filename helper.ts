import {ColorResolvable, EmbedBuilder, EmbedField} from "discord.js";
import {StoredData} from "./persistence";

export type EmbedOptions = {
    title: string,
    description: string,
    color: ColorResolvable,
    fields?: EmbedField[],
}

export const COLORS: Record<string, ColorResolvable> = {
    error: '#e74c3c',
    success: '#2ecc71',
    warning: '#e67e22',
    info: '#9b59b6',
    pick: '#e91e8c',
    suggest: '#3498db',
    history: '#95a5a6'
}

export const createEmbed = (options: EmbedOptions) => {
    const embed = new EmbedBuilder()
        .setColor(options.color)
        .setTitle(options.title)
        .setDescription(options.description)
        .setFooter({ text: 'Lotty' })
        .setTimestamp();

    if (options.fields?.length) {
        embed.addFields(options.fields)
    }

    return embed
}

export const getRandomElement = <T>(list: T[]): T => {
    const randomIndex = Math.floor(Math.random() * list.length)
    return list[randomIndex];
}

export const getRemainingNames = ({names, history}: StoredData): string[] => {
    return names.filter((name) => !history.includes(name));
}

export const findName = (searchString: string, names: string[]) => {
    return names.find((name) => name.toLowerCase() === searchString.trim().toLowerCase());
}
