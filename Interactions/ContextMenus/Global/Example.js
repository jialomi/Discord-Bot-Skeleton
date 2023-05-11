const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js')
const { PermissionFlagsBits } = require('discord-api-types/v9');
const log = require('../../../Addons/Logger');
const path = require('path');
const { EmojiEnums, GuildEnums } = require('../../../Addons/Enums');
const { InteractionError } = require('../../../Addons/Classes');

const fileName = path.basename(__filename).slice(0, -3).toLowerCase();

module.exports = {
    enabled: true,
    guild: GuildEnums.GLOBAL,
    data: new ContextMenuCommandBuilder()
        .setName(fileName)
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            // Destructuring assignment.
            const { user, guild } = interaction;

            // Log who used the command.
            log.info(`[/${fileName}] Command executed by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`);

            // Create reply to defer command execution.
            const reply = await interaction.reply({ content: `${EmojiEnums.LOADING} Preparing reseponse...`});

            // Edit the reply
            await reply.edit({ content: interaction.targetUser.displayAvatarURL() })

            // Fake delay to appear as if the bot is doing something
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Edit the reply
            // await reply.edit({ content: `${fileName} response is handled correctly.` });

        } catch (error) {
            new InteractionError(interaction, fileName).issue(error);
        }
    }
}